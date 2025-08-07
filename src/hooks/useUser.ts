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
      // Сначала проверяем, верифицирован ли аккаунт
      const verificationCheck = await fetch('/api/v1/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const { isVerified } = await verificationCheck.json();

      if (!isVerified) {
        // Если аккаунт не верифицирован, отправляем новый код и переходим к верификации
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

      // Если аккаунт верифицирован, выполняем вход
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
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

      // Отправляем код подтверждения
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

      // После успешной верификации выполняем вход
      const result = await signIn('credentials', {
        redirect: false,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setIsVerifying(false);
      setPendingRegistration(null);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    signOut({ callbackUrl: '/login' });
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
