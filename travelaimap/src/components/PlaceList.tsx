'use client';
import { useState, useMemo } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { Place } from '@/app/page';
import EditPlaceForm from './EditPlace';
import ConfirmationModal from './ConfirmationModal';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesName = place.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDescription = place.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = place.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesName || matchesDescription || matchesCity;
    });
  }, [places, searchTerm]);

  const handleSave = async (updatedPlace: {
    id: string;
    name: string;
    coordinates: GeoPoint;
    description?: string;
  }) => {
    await onUpdatePlace({
      ...updatedPlace,
      city: editingPlace?.city || 'Неизвестное место'
    });
    setEditingPlace(null);
  };

  const handleDeleteClick = (place: Place) => {
    setPlaceToDelete(place);
  };

  const confirmDelete = () => {
    if (placeToDelete) {
      onDeletePlace(placeToDelete.id);
      setPlaceToDelete(null);
      if (selectedPlace?.id === placeToDelete.id) {
        onSelectPlace(null);
      }
    }
  };

  return (
    <div className="w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto flex flex-col">
      {/* Поисковая строка */}
      <div className="p-4 sticky top-0 bg-white z-10 border-b">
        <input
          type="text"
          placeholder="Поиск по названию, описанию или городу..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Форма редактирования с картой */}
      {editingPlace && (
        <EditPlaceForm
          place={editingPlace}
          onClose={() => setEditingPlace(null)}
          onSave={handleSave}
        />
      )}

      {/* Подтверждение удаления */}
      {placeToDelete && (
        <ConfirmationModal
          title="Подтвердите удаление"
          message={`Вы уверены, что хотите удалить место "${placeToDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setPlaceToDelete(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {selectedPlace ? (
          <div className="bg-white p-4 m-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <button 
                onClick={() => onSelectPlace(null)} 
                className="text-blue-500 hover:text-blue-700"
              >
                ← Назад к списку
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPlace(selectedPlace)}
                  className="text-green-500 hover:text-green-700 cursor-pointer"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedPlace)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold">{selectedPlace.name}</h3>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Город:</span> {selectedPlace.city}
            </p>
            {selectedPlace.description && (
              <div className="mt-3">
                <p className="font-semibold">Описание:</p>
                <p className="text-gray-700">{selectedPlace.description}</p>
              </div>
            )}
            <div className="mt-2 text-sm text-gray-500">
              Координаты: {selectedPlace.coordinates.latitude.toFixed(4)}, {selectedPlace.coordinates.longitude.toFixed(4)}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredPlaces.map(place => (
              <li 
                key={place.id} 
                className="p-4 hover:bg-gray-100 cursor-pointer transition"
                onClick={() => onSelectPlace(place)}
              >
                <div className="flex justify-between items-start">
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