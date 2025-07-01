'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  userEmail: string;
  onAddPlace: () => void;
}

export default function AppHeader({ userEmail, onAddPlace }: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.refresh(); // Обновит состояние приложения после выхода
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">TravelAI Map</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm hidden sm:block"><b>{userEmail}</b></span>
          <button
            onClick={onAddPlace}
            className="bg-white text-blue-600 px-4 py-1.5 rounded hover:bg-blue-50 transition"
          >
            Добавить место
          </button>
          <button
            onClick={handleLogout}
            className="border border-white px-3 py-1.5 rounded hover:bg-white hover:text-blue-600 transition"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
