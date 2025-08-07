'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PendingRegistration {
  email: string;
  password: string;
  name?: string;
}

export function useUser() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const verificationCheck = await fetch('/api/v1/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const { isVerified } = await verificationCheck.json();

      if (!isVerified) {
        const verificationResponse = await fetch('/api/v1/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (!verificationResponse.ok) {
          throw new Error('Не удалось отправить код подтверждения');
        }

        setIsVerifying(true);
        setPendingRegistration({ email, password });
        return;
      }

      const loginResponse = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        throw new Error(data.error || 'Неверный email или пароль');
      }

      const loginData = await loginResponse.json();
      const { token, user } = loginData.data || loginData;

      if (token) {
        localStorage.setItem('token', token);
        if (user?.name) localStorage.setItem('userName', user.name);
        if (user?.email) localStorage.setItem('userEmail', user.email);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
      }

      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      const verificationResponse = await fetch('/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!verificationResponse.ok) {
        throw new Error('Не удалось отправить код подтверждения');
      }

      setIsVerifying(true);
      setPendingRegistration({ email, password, name });
      return { needsVerification: true };
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (code: string) => {
    if (!pendingRegistration) {
      throw new Error('Нет ожидающей регистрации');
    }

    try {
      const response = await fetch('/api/v1/auth/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingRegistration.email,
          code
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Неверный код подтверждения');
      }

      const loginResponse = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: pendingRegistration.email, 
          password: pendingRegistration.password 
        })
      });

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        throw new Error(data.error || 'Ошибка входа после верификации');
      }

      const loginData = await loginResponse.json();
      const { token, user } = loginData.data || loginData;

      if (token) {
        localStorage.setItem('token', token);
        if (user?.name) localStorage.setItem('userName', user.name);
        if (user?.email) localStorage.setItem('userEmail', user.email);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
      }

      setIsVerifying(false);
      setPendingRegistration(null);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'));
    }
    
    router.push('/login');
  };

  return {
    login,
    register,
    verifyCode,
    logout,
    isVerifying,
    pendingRegistration
  };
}
