'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-60 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {isLogin ? 'Вход' : 'Регистрация'}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button className="w-full bg-blue-500 text-white py-2 rounded cursor-pointer hover:bg-blue-600">
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        {isLogin ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 cursor-pointer underline"
        >
          {isLogin ? 'Регистрация' : 'Вход'}
        </button>
      </p>
      <button
        onClick={async () => {
          try {
            await signInAnonymously(auth);
          } catch (err) {
            console.error('Ошибка анонимного входа:', err);
          }
        }}
        className="mt-4 w-full text-sm text-gray-600 cursor-pointer underline"
      >
        Продолжить без входа
      </button>
    </div>
  );
}
