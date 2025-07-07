'use client';
import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center  bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-black"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">О приложении</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Это интерактивная карта путешествий, где вы можете добавлять посещённые места,
          получать AI-рекомендации на основе ваших интересов и просматривать интересные
          места поблизости. Данные сохраняются в вашей учетной записи.
        </p>
        <p className="text-gray-500 text-xs mt-4">
          Разработано для исследователей и путешественников.
        </p>
      </div>
    </div>
  );
}
