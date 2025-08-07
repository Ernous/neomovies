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
    try {
      const response = await authAPI.login(email, password);
      const data = response.data.data || response.data;
      if (data?.token) {
        localStorage.setItem('token', data.token);
        let name: string | undefined = undefined;
        let emailVal: string | undefined = undefined;
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          name = payload.name || payload.username || payload.userName || payload.sub || undefined;
          emailVal = payload.email || undefined;
        } catch {}
        if (!name) name = data.user?.name || data.name || data.userName;
        if (!emailVal) emailVal = data.user?.email || data.email;
        if (name) localStorage.setItem('userName', name);
        if (emailVal) localStorage.setItem('userEmail', emailVal);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        neoApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        router.push('/');
      } else {
        throw new Error(data?.error || 'Login failed');
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        throw new Error('Неверный логин или пароль');
      }
      throw new Error(err?.message || 'Произошла ошибка');
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
