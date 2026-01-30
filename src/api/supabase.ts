import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL ve Key tanımlanmalıdır");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth fonksiyonları
export const authService = {
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    return data;
  },

  async getUsername(userId: string): Promise<string> {
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.user_metadata?.username || "Anonim";
  },
};
