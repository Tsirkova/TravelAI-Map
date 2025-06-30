'use client';
import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthModalProps {
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
  onSuccess: () => void;
}

export const AuthModal = ({
  initialMode,
  onClose,
  onSwitchMode,
  onSuccess
}: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    onSwitchMode(newMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        
        {mode === 'signin' ? (
          <SignIn 
            onClose={onClose}
            onSuccess={onSuccess}
            onSwitch={() => handleSwitchMode('signup')}
          />
        ) : (
          <SignUp
            onClose={onClose}
            onSuccess={onSuccess}
            onSwitch={() => handleSwitchMode('signin')}
          />
        )}
      </div>
    </div>
  );
};