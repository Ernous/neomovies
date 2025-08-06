'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestAuthPage() {
  const [email, setEmail] = useState('neo.movies.mail@gmail.com');
  const [password, setPassword] = useState('Vfhreif!1');
  const [status, setStatus] = useState('');
  const { login } = useAuth();

  const handleTestLogin = async () => {
    try {
      setStatus('Пытаемся войти...');
      await login(email, password);
      setStatus('✅ Вход успешен!');
    } catch (error) {
      console.error('Login error:', error);
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Тест аутентификации</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleTestLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Тестировать вход
          </button>
          
          {status && (
            <div className={`p-3 rounded ${
              status.includes('✅') ? 'bg-green-100 text-green-800' : 
              status.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}