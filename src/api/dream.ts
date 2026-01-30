import { supabase } from "./supabase";
import { Dream, ListDreamsFilter } from "@/types/dream";

export const dreamApi = {
  async listDreams(filters: ListDreamsFilter, userId?: string): Promise<Dream[]> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return [];
      }

      let query = supabase
        .from("dreams")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false });

      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
      }

      if (filters.mood) {
        query = query.eq("mood", filters.mood);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        title: d.title,
        content: d.content,
        occurredAt: d.occurred_at,
        mood: d.mood,
        intensity: d.intensity,
        lucid: d.lucid,
        tags: d.tags || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch (err) {
      console.error("listDreams error:", err);
      return [];
    }
  },

  async getDream(id: string): Promise<Dream | null> {
    try {
      const { data, error } = await supabase
        .from("dreams")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        occurredAt: data.occurred_at,
        mood: data.mood,
        intensity: data.intensity,
        lucid: data.lucid,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error("getDream error:", err);
      return null;
    }
  },

  async upsertDream(dream: Dream): Promise<Dream> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("dreams")
        .upsert({
          id: dream.id,
          user_id: userData.user.id,
          title: dream.title,
          content: dream.content,
          occurred_at: dream.occurredAt,
          mood: dream.mood,
          intensity: dream.intensity,
          lucid: dream.lucid,
          tags: dream.tags,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return dream;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        occurredAt: data.occurred_at,
        mood: data.mood,
        intensity: data.intensity,
        lucid: data.lucid,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error("upsertDream error:", err);
      throw err;
    }
  },

  async deleteDream(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("dreams")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("deleteDream error:", err);
      throw err;
    }
  },

  async exportJson(): Promise<string> {
    try {
      const dreams = await this.listDreams({});
      return JSON.stringify(dreams, null, 2);
    } catch (err) {
      console.error("exportJson error:", err);
      throw err;
    }
  },

  async importJson(json: string): Promise<{ imported: number; updated: number }> {
    try {
      const dreams = JSON.parse(json);
      let imported = 0;
      let updated = 0;

      for (const dream of dreams) {
        try {
          await this.upsertDream(dream);
          dream.id ? updated++ : imported++;
        } catch (e) {
          console.error("Error importing dream:", e);
        }
      }

      return { imported, updated };
    } catch (err) {
      console.error("importJson error:", err);
      throw err;
    }
  },

  async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  },

  async verifyPin(pin: string, hash: string): Promise<boolean> {
    const pinHash = await this.hashPin(pin);
    return pinHash === hash;
  },

  async getAppPaths(): Promise<{ dbPath: string }> {
    return { dbPath: "cloud" };
  },

  // Paylaşılan rüyaları getir
  async getSharedDreams(userId?: string): Promise<Dream[]> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return [];
      }

      // Share'ı dinle ve rüyayı çek
      const { data: shares, error: sharesError } = await supabase
        .from("dream_shares")
        .select("dream_id")
        .eq("shared_with", userId);

      if (sharesError) throw sharesError;
      if (!shares || shares.length === 0) return [];

      const dreamIds = shares.map(s => s.dream_id);

      const { data: dreams, error: dreamsError } = await supabase
        .from("dreams")
        .select("*")
        .in("id", dreamIds)
        .order("occurred_at", { ascending: false });

      if (dreamsError) throw dreamsError;

      return (dreams || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        title: d.title,
        content: d.content,
        occurredAt: d.occurred_at,
        mood: d.mood,
        intensity: d.intensity,
        lucid: d.lucid,
        tags: d.tags || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch (err) {
      console.error("getSharedDreams error:", err);
      return [];
    }
  },

  // Rüyayı başkasıyla paylaş
  async shareDream(dreamId: string, shareWithUserId: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("dream_shares")
        .insert({
          dream_id: dreamId,
          shared_by: userData.user.id,
          shared_with: shareWithUserId,
        });

      if (error) throw error;
    } catch (err) {
      console.error("shareDream error:", err);
      throw err;
    }
  },

  // Paylaşımı kaldır
  async unshare(dreamId: string, unshareWithUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("dream_shares")
        .delete()
        .eq("dream_id", dreamId)
        .eq("shared_with", unshareWithUserId);

      if (error) throw error;
    } catch (err) {
      console.error("unshare error:", err);
      throw err;
    }
  },

  // Tüm kullanıcıları getir (share için)
  async getAllUsers(): Promise<{ id: string; username: string }[]> {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      return (data?.users || [])
        .filter(u => u.user_metadata?.username)
        .map(u => ({
          id: u.id,
          username: u.user_metadata.username,
        }));
    } catch (err) {
      console.error("getAllUsers error:", err);
      return [];
    }
  },
};
