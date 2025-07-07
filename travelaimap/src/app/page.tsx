'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import dynamic from 'next/dynamic';

// Динамический импорт компонентов, использующих браузерные API
const TravelMapPage = dynamic(() => import('../components/MapPage'), {
  ssr: false,
});
const AuthForm = dynamic(() => import('@/components/AuthForm'), { ssr: false });
const AppHeader = dynamic(() => import('@/components/AppHeader'), { ssr: false });
const HelpModal = dynamic(() => import('@/components/modals/HelpModal'), { ssr: false });
const ConfirmationModal = dynamic(() => import('@/components/modals/ConfirmationModal'), { ssr: false });

function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsDemo(user?.isAnonymous ?? false);
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
      <AppHeader
        userEmail={user.email || (isDemo ? 'Гость' : 'неизвестен')}
        onAddPlace={() => {
          if (isDemo) {
            setShowLoginPrompt(true);
          } else {
            setShowForm(true);
          }
        }}
        onHelpClick={() => setShowHelp(true)}
        isDemo={isDemo}
        onLogout={async () => {
          await auth.signOut();
          setUser(null);
        }}
      />
      <TravelMapPage showForm={showForm} setShowForm={setShowForm} />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showLoginPrompt && (
        <ConfirmationModal
          title="Доступ ограничен"
          message="Чтобы добавлять места, пожалуйста, войдите."
          onConfirm={async () => {
            setShowLoginPrompt(false);
            await auth.signOut();
          }}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(Page), { ssr: false });