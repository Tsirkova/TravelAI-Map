'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

interface SignInProps {
  onClose: () => void;
  onSuccess: () => void;
  onSwitch: () => void;
  setUser?: (user: any) => void;
}

export const SignIn = ({ onClose, onSuccess, onSwitch, setUser }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser?.(userCredential.user);
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Поля формы */}
      <button type="submit" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>
      <button type="button" onClick={onSwitch}>
        Нет аккаунта? Зарегистрироваться
      </button>
    </form>
  );
};