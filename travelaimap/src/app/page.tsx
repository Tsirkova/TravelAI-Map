// ✅ app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import TravelMapPage from './MapPage';
import AuthForm from '@/components/AuthForm';
import AppHeader from '@/components/AppHeader';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthForm />;

  return (
    <>
      <AppHeader userEmail={user.email || 'неизвестен'} onAddPlace={() => setShowForm(true)} />
      <TravelMapPage showForm={showForm} setShowForm={setShowForm} />
    </>
  );
}
