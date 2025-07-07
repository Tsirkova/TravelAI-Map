'use client';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  userEmail: string;
  onAddPlace: () => void;
  onHelpClick: () => void;
  isDemo: boolean;
  onLogout: () => void;
}

export default function AppHeader({ userEmail, onAddPlace, onHelpClick, isDemo, onLogout }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">TravelAI Map</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm hidden sm:block"><b>{userEmail}</b></span>
          <button
            onClick={onHelpClick}
            className="px-4 py-1.5 rounded hover:bg-blue-50 transition"
          >
            ❓
          </button>
          <button
            onClick={onAddPlace}
            className="bg-white text-blue-600 px-4 py-1.5 rounded hover:bg-blue-50 transition"
          >
            Добавить место
          </button>
          <button
            onClick={onLogout}
            className="border border-white px-3 py-1.5 rounded hover:bg-white hover:text-blue-600 transition"
          >
            {isDemo ? 'Войти' : 'Выйти'}
          </button>
        </div>
      </div>
    </header>
  );
}
