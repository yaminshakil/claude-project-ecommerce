'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ApiResponse, User } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { setUser, setToken, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/login',
      { email, password }
    );
    const { token, user } = response.data.data;
    setToken(token);
    setUser(user);
    toast.success('Logged in successfully!');
    if (user.role === 'admin' || user.role === 'super_admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/register',
      { name, email, password }
    );
    const { token, user } = response.data.data;
    setToken(token);
    setUser(user);
    toast.success('Account created successfully!');
    router.push('/');
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore server errors on logout
    } finally {
      storeLogout();
      toast.success('Logged out successfully!');
      router.push('/');
    }
  };

  const fetchUser = async (): Promise<void> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    setUser(response.data.data);
  };

  return { login, register, logout, fetchUser };
}
