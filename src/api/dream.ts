import { invoke } from "@tauri-apps/api/core";
import { Dream, ListDreamsFilter } from "@/types/dream";

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const dreamApi = {
  async listDreams(filters: ListDreamsFilter): Promise<Dream[]> {
    try {
      if (!isTauri()) {
        // Localhost test için boş array dön
        return [];
      }
      return invoke("list_dreams", { filters });
    } catch (err) {
      console.error("listDreams error:", err);
      return [];
    }
  },

  async getDream(id: string): Promise<Dream | null> {
    try {
      if (!isTauri()) return null;
      return invoke("get_dream", { id });
    } catch (err) {
      console.error("getDream error:", err);
      return null;
    }
  },

  async upsertDream(dream: Dream): Promise<Dream> {
    try {
      if (!isTauri()) throw new Error("Tauri context not available");
      return invoke("upsert_dream", { dream });
    } catch (err) {
      console.error("upsertDream error:", err);
      throw err;
    }
  },

  async deleteDream(id: string): Promise<void> {
    try {
      if (!isTauri()) throw new Error("Tauri context not available");
      return invoke("delete_dream", { id });
    } catch (err) {
      console.error("deleteDream error:", err);
      throw err;
    }
  },

  async exportJson(): Promise<string> {
    try {
      if (!isTauri()) return "{}";
      return invoke("export_json");
    } catch (err) {
      console.error("exportJson error:", err);
      throw err;
    }
  },

  async importJson(json: string): Promise<{ imported: number; updated: number }> {
    try {
      if (!isTauri()) throw new Error("Tauri context not available");
      const result = await invoke<[number, number]>("import_json", { json });
      return { imported: result[0], updated: result[1] };
    } catch (err) {
      console.error("importJson error:", err);
      throw err;
    }
  },

  async getAppPaths(): Promise<{ dbPath: string }> {
    try {
      if (!isTauri()) return { dbPath: "localhost" };
      return invoke("get_app_paths");
    } catch (err) {
      console.error("getAppPaths error:", err);
      throw err;
    }
  },

  async hashPin(pin: string): Promise<string> {
    try {
      if (!isTauri()) throw new Error("Tauri context not available");
      return await invoke("hash_pin", { pin });
    } catch (err) {
      console.error("hashPin error:", err);
      throw err;
    }
  },

  async verifyPin(pin: string, hash: string): Promise<boolean> {
    try {
      if (!isTauri()) {
        console.error("verifyPin: Tauri context not available");
        return false;
      }
      return await invoke("verify_pin", { pin, hash });
    } catch (err) {
      console.error("verifyPin error:", err);
      return false;
    }
  },
};
