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
        user_id: data.user_id,
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

  // Paylaşılan rüyaları getir (kendisine paylaşılanlar)
  async getSharedDreams(userId?: string): Promise<Dream[]> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return [];
      }

      // Get shares with shared_by info
      const { data: shares, error: sharesError } = await supabase
        .from("dream_shares")
        .select("dream_id, shared_by")
        .eq("shared_with", userId);

      if (sharesError) throw sharesError;
      if (!shares || shares.length === 0) return [];

      const dreamIds = shares.map(s => s.dream_id);
      const sharesByDreamId: { [key: string]: string } = {};
      shares.forEach(s => {
        sharesByDreamId[s.dream_id] = s.shared_by;
      });

      const { data: dreams, error: dreamsError } = await supabase
        .from("dreams")
        .select("*")
        .in("id", dreamIds)
        .order("occurred_at", { ascending: false });

      if (dreamsError) throw dreamsError;

      // Get username for shared_by user
      const getUsername = (userId: string): string => {
        if (userId === "1aa610f9-1eb2-467e-9ce5-882954b2b5ee") return "mina";
        if (userId === "f35a476a-0c50-4817-9f35-4d4908e79663") return "anil";
        return `User-${userId.substring(0, 8)}`;
      };

      return (dreams || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        sharedBy: getUsername(sharesByDreamId[d.id]),
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

  // Paylaştığı rüyaları getir (user'ın paylaştığı - my-dreams tab'ında badge için)
  async getOwnSharedDreamIds(userId?: string): Promise<string[]> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return [];
      }

      const { data: shares, error } = await supabase
        .from("dream_shares")
        .select("dream_id")
        .eq("shared_by", userId);

      if (error) throw error;
      return (shares || []).map(s => s.dream_id);
    } catch (err) {
      console.error("getOwnSharedDreamIds error:", err);
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
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      console.log("getCurrentUser:", currentUser?.id, currentUser?.email);
      
      // Try profiles table first
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username");
      
      console.log("profiles query:", profiles, profilesError);
      
      if (profiles && profiles.length > 0) {
        return profiles
          .filter(p => p.id !== currentUser?.id)
          .map(p => ({
            id: p.id,
            username: p.username,
          }));
      }
      
      // Fallback: Get users from dreams table - select ALL fields
      const { data: dreamsData, error: dreamsError } = await supabase
        .from("dreams")
        .select("*");
      
      console.log("dreams fallback:", dreamsData, dreamsError);
      if (dreamsData && dreamsData.length > 0) {
        console.log("sample dream:", dreamsData[0]);
      }
      
      if (dreamsError) throw dreamsError;

      // Extract unique user IDs from all dreams
      const userIds = [...new Set((dreamsData || []).map(d => d.user_id))];
      console.log("extracted userIds:", userIds);
      const filteredUsers = userIds.filter(id => id !== currentUser?.id);
      console.log("filtered users (excluding current):", filteredUsers);
      
      // Get emails for usernames - for now use hardcoded demo mapping
      const emailMap: { [key: string]: string } = {};
      
      return filteredUsers.map(id => {
        // Hardcoded demo email mapping for testing
        if (id === "1aa610f9-1eb2-467e-9ce5-882954b2b5ee") {
          return { id, username: "mina" };
        }
        if (id === "f35a476a-0c50-4817-9f35-4d4908e79663") {
          return { id, username: "anil" };
        }
        return {
          id,
          username: `User-${id.substring(0, 8)}`,
        };
      });
    } catch (err) {
      console.error("getAllUsers error:", err);
      return [];
    }
  },

  // Bildirimleri getir
  async getNotifications(userId?: string): Promise<any[]> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return [];
      }

      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("id, shared_by, dream_id, is_read, created_at")
        .eq("shared_with", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get dream details for each notification
      const dreamIds = [...new Set((notifications || []).map(n => n.dream_id))];
      
      let dreams: any[] = [];
      if (dreamIds.length > 0) {
        const { data: dreamsData } = await supabase
          .from("dreams")
          .select("id, title, mood")
          .in("id", dreamIds);
        dreams = dreamsData || [];
      }

      const dreamMap = new Map(dreams.map(d => [d.id, d]));

      // Map shared_by to username
      const getUsername = (userId: string): string => {
        if (userId === "1aa610f9-1eb2-467e-9ce5-882954b2b5ee") return "mina";
        if (userId === "f35a476a-0c50-4817-9f35-4d4908e79663") return "anil";
        return `User-${userId.substring(0, 8)}`;
      };

      return (notifications || []).map(n => {
        const dream = dreamMap.get(n.dream_id);
        return {
          id: n.id,
          sharedBy: getUsername(n.shared_by),
          dreamId: n.dream_id,
          dreamTitle: dream?.title || "Rüya",
          dreamMood: dream?.mood || "neutral",
          isRead: n.is_read,
          createdAt: n.created_at,
        };
      });
    } catch (err) {
      console.error("getNotifications error:", err);
      return [];
    }
  },

  // Bildirimi oku olarak işaretle
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (err) {
      console.error("markNotificationAsRead error:", err);
    }
  },

  // Tüm bildirimleri oku olarak işaretle
  async markAllNotificationsAsRead(userId?: string): Promise<void> {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
        if (!userId) return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("shared_with", userId)
        .eq("is_read", false);

      if (error) throw error;
    } catch (err) {
      console.error("markAllNotificationsAsRead error:", err);
    }
  },
};

