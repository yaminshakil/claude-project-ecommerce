'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { getToken, setToken, removeToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    setToken(token);
    set({ token });
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null });
  },

  initialize: () => {
    const token = getToken();
    set({ token, isLoading: false });
  },
}));
