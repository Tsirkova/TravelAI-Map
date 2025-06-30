'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useRef, useEffect } from 'react';
import { Place } from '@/app/page';


// Маркеры
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const placeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  userLocation: [number, number];
  places: Place[];
  onPlaceClick: (place: Place) => void;
  showForm: boolean;
  onShowForm: (show: boolean) => void;
  selectedPlace: Place | null; // Добавляем пропс
}

export default function MapComponent({
  userLocation,
  places,
  onPlaceClick,
  showForm,
  onShowForm,
  selectedPlace
}: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);

  // Автоматически центрируем карту при изменении selectedPlace
  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      const { latitude, longitude } = selectedPlace.coordinates;
      mapRef.current.flyTo([latitude, longitude], 15);

    }
  }, [selectedPlace]);

  // Функция для удаления места
  const handleDeletePlace = async (placeId: string) => {
    try {
      await deleteDoc(doc(db, 'places', placeId));
      setPlaces(places.filter(place => place.id !== placeId));
      setSelectedPlace(null); // Закрываем карточку после удаления
    } catch (error) {
      setError('Ошибка при удалении места');
      console.error(error);
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="flex-1 relative w-2/3">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />


        {/* Текущее местоположение пользователя */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Вы здесь!</Popup>
        </Marker>

        {/* Все места */}
        {places.map(place => (
          <Marker
            key={place.id}
            position={[place.coordinates.latitude, place.coordinates.longitude]}
            icon={selectedPlace?.id === place.id ? selectedIcon : placeIcon}
            eventHandlers={{
              click: () => onPlaceClick(place),
            }}
          >
            <Popup>
              <b>{place.name}</b>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Кнопка добавления нового места */}
      <button
        onClick={() => onShowForm(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg absolute bottom-10 right-4 z-[1000]"
      >
        +
      </button>
    
    </div>
  );
}