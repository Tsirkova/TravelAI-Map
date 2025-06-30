import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

// components/SignUp.tsx
interface SignUpProps {
  onClose: () => void;
  onSuccess: () => void; // Добавляем отсутствующий пропс
  onSwitch: () => void;
  setUser?: (user: any) => void; // Опциональный, если используется
}

export const SignUp = ({ onClose, setUser }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Сохраняем дополнительную информацию в Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
        places: [],
        createdAt: new Date(),
      });

      setUser?.(userCredential.user);
      onClose();
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('Email уже используется');
            break;
          case 'auth/weak-password':
            setError('Пароль должен содержать минимум 6 символов');
            break;
          default:
            setError('Ошибка при регистрации');
        }
      } else {
        setError('Неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Уже есть аккаунт? <button type="button" onClick={() => {/* Переключение на SignIn */}}>
          Войти
        </button></p>
      </div>
    </div>
  );
};