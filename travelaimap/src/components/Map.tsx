'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs, GeoPoint, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { addDoc } from 'firebase/firestore';
import AddNewPlace from './AddNewPlace';

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

interface Place {
  id: string;
  name: string;
  coordinates: GeoPoint;
  description?: string;
  city?: string;
}

export default function Map() {
  const [userLocation, setUserLocation] = useState<[number, number]>([54.98, 82.89]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Функция для получения города по координатам
  const getCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      return data.address?.city || 
             data.address?.town || 
             data.address?.village || 
             data.address?.county || 
             'Неизвестное место';
    } catch (err) {
      console.error('Ошибка геокодирования:', err);
      return 'Неизвестное место';
    }
  };

  // Геолокация пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
        },
        (err) => setError(`Геолокация: ${err.message}`)
      );
    } else {
      setError('Геолокация не поддерживается');
    }
  }, []);

  // Загрузка мест с добавлением информации о городе
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'places'));
        const placesWithCities = await Promise.all(
          querySnapshot.docs.map(async doc => {
            const placeData = doc.data();
            const city = await getCityName(
              placeData.coordinates.latitude, 
              placeData.coordinates.longitude
            );
            
            return {
              id: doc.id,
              name: placeData.name,
              coordinates: placeData.coordinates,
              description: placeData.description,
              city: city
            };
          })
        );
        
        setPlaces(placesWithCities);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaces();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Загрузка...</div>;

  const handleAddPlace = async (placeData: {
    name: string;
    coordinates: GeoPoint;
    description?: string;
  }) => {
    try {
      const city = await getCityName(
        placeData.coordinates.latitude, 
        placeData.coordinates.longitude
      );
      
      await addDoc(collection(db, 'places'), {
        ...placeData,
        city: city
      });
      
      // Обновляем список мест
      const querySnapshot = await getDocs(collection(db, 'places'));
      const updatedPlaces = await Promise.all(
        querySnapshot.docs.map(async doc => {
          const placeData = doc.data();
          const city = await getCityName(
            placeData.coordinates.latitude, 
            placeData.coordinates.longitude
          );
          
          return {
            id: doc.id,
            name: placeData.name,
            coordinates: placeData.coordinates,
            description: placeData.description,
            city: city
          };
        })
      );
      
      setPlaces(updatedPlaces);
    } catch (error) {
      setError('Ошибка при добавлении места');
      console.error(error);
    }
  };

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
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">TravelAI Map</h1>
        {error && <p className="text-yellow-200 text-sm mt-1">{error}</p>}
      </header>

      <div className="flex flex-1">
        {/* Карта (2/3 ширины) */}
        <div className="flex-1 relative w-2/3">
          <MapContainer center={userLocation} zoom={13} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <Marker position={userLocation} icon={userIcon}>
              <Popup>Вы здесь!</Popup>
            </Marker>

            {places.map(place => (
              <Marker
                key={place.id}
                position={[place.coordinates.latitude, place.coordinates.longitude]}
                icon={placeIcon}
                eventHandlers={{
                  click: () => handlePlaceClick(place),
                }}
              >
                <Popup>
                  <b>{place.name}</b>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg absolute bottom-10 right-4 z-[1000]"
          >
            +
          </button>

          {showForm && (
            <AddNewPlace
              onClose={() => setShowForm(false)}
              onAdd={handleAddPlace}
              userLocation={{ lat: userLocation[0], lng: userLocation[1] }}
            />
          )}
        </div>

        {/* Боковая панель (1/3 ширины) */}
        <div className="w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Список мест</h2>
            
            {selectedPlace ? (
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-start">
                  <button 
                    onClick={() => setSelectedPlace(null)} 
                    className="mb-2 text-blue-500 hover:text-blue-700"
                  >
                    ← Назад к списку
                  </button>
                  <button
                    onClick={() => handleDeletePlace(selectedPlace.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Удалить место"
                  >
                    Удалить
                  </button>
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
                    onClick={() => handlePlaceClick(place)}
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
      </div>
    </div>
  );
}