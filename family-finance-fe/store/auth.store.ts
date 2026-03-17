import { create } from "zustand";

interface AuthState {
  user: IUser | null;
  token: string | null;

  // Lưu sau khi login thành công
  setAuth: (user: IUser, token: string) => void;

  // Cập nhật user (sau đổi profile)
  setUser: (user: Partial<IUser>) => void;

  // Đăng xuất
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
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
}));
