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

export function useAuth() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    // API возвращает { success: true, data: { token, user } }
    const data = response.data.data || response.data;
    if (data?.token) {
      localStorage.setItem('token', data.token);

      // Extract name/email either from API response or JWT payload
      let name: string | undefined = undefined;
      let email: string | undefined = undefined;
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        name = payload.name || payload.username || payload.userName || payload.sub || undefined;
        email = payload.email || undefined;
      } catch {
        // silent
      }
      if (!name) name = data.user?.name || data.name || data.userName;
      if (!email) email = data.user?.email || data.email;

      if (name) localStorage.setItem('userName', name);
      if (email) localStorage.setItem('userEmail', email);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }

      neoApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      router.push('/');
    } else {
      throw new Error(data?.error || 'Login failed');
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
