'use client';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}