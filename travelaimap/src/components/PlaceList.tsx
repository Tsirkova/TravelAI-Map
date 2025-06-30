'use client';
import { useState } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { Place } from '@/app/page';
import EditPlaceForm from './EditPlace';

interface PlacesListProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onDeletePlace: (placeId: string) => void;
  onUpdatePlace: (updatedPlace: Place) => void;
}

export default function PlacesList({
  places,
  selectedPlace,
  onSelectPlace,
  onDeletePlace,
  onUpdatePlace
}: PlacesListProps) {
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const handleSave = async (updatedPlace: {
    id: string;
    name: string;
    coordinates: GeoPoint;
    description?: string;
  }) => {
    onUpdatePlace({
      ...updatedPlace,
      city: editingPlace?.city || 'Неизвестное место'
    });
    setEditingPlace(null);
  };

  return (
    <div className="w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Список мест</h2>
        
        {editingPlace && (
          <EditPlaceForm
            place={editingPlace}
            onClose={() => setEditingPlace(null)}
            onSave={handleSave}
          />
        )}

        {selectedPlace ? (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex justify-between items-start">
              <button 
                onClick={() => onSelectPlace(null)} 
                className="mb-2 text-blue-500 hover:text-blue-700"
              >
                ← Назад к списку
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPlace(selectedPlace)}
                  className="text-green-500 hover:text-green-700"
                  title="Редактировать место"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => onDeletePlace(selectedPlace.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Удалить место"
                >
                  Удалить
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold">{selectedPlace.name}</h3>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Город:</span> {selectedPlace.city}
            </p>
            {selectedPlace.description && (
              <div className="mt-3">
                <p className="font-semibold">Описание:</p>
                <p className="text-gray-700">{selectedPlace.description}</p>
              </div>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {places.map(place => (
              <li 
                key={place.id} 
                className="bg-white p-3 rounded-lg shadow cursor-pointer hover:bg-blue-50 transition"
                onClick={() => onSelectPlace(place)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{place.name}</h3>
                    <p className="text-sm text-gray-500">
                      {place.city}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}