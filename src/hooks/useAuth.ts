"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authAPI } from '../lib/authApi';
import { neoApi } from '../lib/neoApi';

interface PendingRegistration {
  email: string;
  password: string;
  name?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    verified: boolean;
    isAdmin: boolean;
    adminVerified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export function useAuth() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const data = response.data as LoginResponse;
      
      if (data?.token) {
        localStorage.setItem('token', data.token);

        // Сохраняем информацию о пользователе
        if (data.user?.name) localStorage.setItem('userName', data.user.name);
        if (data.user?.email) localStorage.setItem('userEmail', data.user.email);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }

        neoApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        router.push('/');
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    await authAPI.register({ email, password, name });
    const pendingData = { email, password, name };
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingVerification', JSON.stringify(pendingData));
    }
    setIsVerifying(true);
    setPending(pendingData);
  };

  const verifyCode = async (code: string) => {
    let pendingData = pending;
    if (!pendingData && typeof window !== 'undefined') {
      const storedPending = localStorage.getItem('pendingVerification');
      if (storedPending) {
        pendingData = JSON.parse(storedPending);
        setPending(pendingData);
      }
    }

    if (!pendingData) {
      throw new Error('Сессия подтверждения истекла. Пожалуйста, попробуйте зарегистрироваться снова.');
    }
    
    await authAPI.verify(pendingData.email, code);
    await login(pendingData.email, pendingData.password);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingVerification');
    }
    setIsVerifying(false);
    setPending(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete neoApi.defaults.headers.common['Authorization'];
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'));
    }
    router.push('/login');
  };

  return { login, register, verifyCode, logout, isVerifying };
}
