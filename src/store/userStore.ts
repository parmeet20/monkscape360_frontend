import { create } from "zustand";
import { UserResponse } from "@/types";

export type Role = "admin" | "tourist" | "local_community" | "researcher";

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    setUser: (user: UserResponse) => void;
    setToken: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    logout: () => set({ user: null, token: null }),
}));
