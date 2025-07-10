'use client';
import { useState, useMemo } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { Place } from '@/components/MapPage';
import EditPlaceForm from './place/EditPlace';
import ConfirmationModal from './modals/ConfirmationModal';

interface PlacesListProps {
  places: Place[];
  recommendationsNearby: Place[];
  recommendationsSimilar: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onDeletePlace: (placeId: string) => void;
  onUpdatePlace: (updatedPlace: Place) => void;
}

export default function PlacesList({
  places,
  recommendationsNearby,
  recommendationsSimilar,
  selectedPlace,
  onSelectPlace,
  onDeletePlace,
  onUpdatePlace
}: PlacesListProps) {
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filterPlaces = (arr: Place[]) =>
    arr.filter((place) => {
      const term = searchTerm.toLowerCase();
      return (
        place.name.toLowerCase().includes(term) ||
        place.description?.toLowerCase().includes(term) ||
        place.city?.toLowerCase().includes(term)
      );
    });

  const myPlaces = useMemo(() => filterPlaces(places), [filterPlaces, places, searchTerm]);
  const nearbyAI = useMemo(() => filterPlaces(recommendationsNearby), [filterPlaces, recommendationsNearby, searchTerm]);
  const similarAI = useMemo(() => filterPlaces(recommendationsSimilar), [filterPlaces, recommendationsSimilar, searchTerm]);
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({
  nearby: false,
  similar: false
}); 

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
      onDeletePlace(placeToDelete.id!);
      setPlaceToDelete(null);
      if (selectedPlace?.id === placeToDelete.id) {
        onSelectPlace(null);
      }
    }
  };

const toggleTooltip = (key: string) => {
  setOpenTooltips(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};

const renderSection = (key: string, title: string, data: Place[], editable: boolean) => {
  const collapsed = collapsedSections[key];
  const isTooltipOpen = openTooltips[key];

  const tooltipText = 
    key === 'nearby' 
      ? 'Места, рекомендованные на основе вашей геолокации' 
      : key === 'similar' 
      ? 'Места, рекомендованные на основе тех, которые вы уже посетили' 
      : '';

  return (
    <div className="p-4">
      <button
        onClick={() => toggleSection(key)}
        className="flex justify-between items-center w-full text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {tooltipText && (
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTooltip(key);
                }}
                className="
                  flex items-center justify-center
                  w-5 h-5 rounded-full 
                  bg-gray-200 hover:bg-gray-300
                  text-gray-600 hover:text-gray-800
                  text-xs font-medium
                  cursor-help focus:outline-none
                  transition-colors duration-200
                "
                aria-label="Показать подсказку"
              >
                ?
              </button>
              {isTooltipOpen && (
                <div className="absolute z-10 bottom-full left-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg">
                  {tooltipText}
                  <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-gray-800"></div>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-gray-500 text-sm">{collapsed ? '▼' : '▲'}</span>
      </button>

      {!collapsed && (
        <ul className="divide-y divide-gray-200 mt-2">
          {data.map((place) => (
            <li
              key={`${place.id || place.name}-${place.city}`}
              className="p-4 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => onSelectPlace(place)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-gray-500">{place.city}</p>
                </div>
                {editable && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPlace(place);
                      }}
                      className="text-green-500 cursor-pointer hover:text-green-700"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(place);
                      }}
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

  return (
    <div className="w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 sticky top-0 bg-white z-10 border-b">
        <input
          type="text"
          placeholder="Поиск по названию, описанию или городу..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {editingPlace && (
        <EditPlaceForm
          place={editingPlace}
          onClose={() => setEditingPlace(null)}
          onSave={handleSave}
        />
      )}

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
                className="text-blue-500 cursor-pointer hover:text-blue-700"
              >
                ← Назад к списку
              </button>
              {selectedPlace.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPlace(selectedPlace)}
                    className="text-green-500 cursor-pointer hover:text-green-700"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedPlace)}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              )}
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
          </div>
        ) : (
          <>
            {renderSection('visited', 'Вы уже были здесь', myPlaces, true)}
            {renderSection('nearby', 'Интересное рядом', nearbyAI, false)}
            {renderSection('similar', 'Может понравиться', similarAI, false)}
          </>
        )}
      </div>
    </div>
  );
}