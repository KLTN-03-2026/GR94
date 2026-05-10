import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  setUser: (user: Partial<any>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({ user, token });
        if (typeof document !== "undefined") {
          document.cookie = `token=${token};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
        }
      },

      setUser: (partial) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partial } });
      },

      clear: () => {
        set({ user: null, token: null });
        if (typeof document !== "undefined") {
          document.cookie = "token=;max-age=0;path=/";
        }
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
    }
  )
);
