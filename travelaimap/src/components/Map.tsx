'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';

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
}

export default function Map() {
  const [userLocation, setUserLocation] = useState<[number, number]>([54.98, 82.89]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Геолокация
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => setError(`Геолокация: ${err.message}`)
      );
    } else {
      setError('Геолокация не поддерживается');
    }
  }, []);

  // Загрузка мест
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'places'));
        const placesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          coordinates: doc.data().coordinates, // GeoPoint из Firestore
          description: doc.data().description
        }));
        setPlaces(placesData);
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

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">TravelAI Map</h1>
        {error && <p className="text-yellow-200 text-sm mt-1">{error}</p>}
      </header>

      <div className="flex-1 relative">
        <MapContainer center={userLocation} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Текущее местоположение */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Вы здесь!</Popup>
          </Marker>

          {/* Сохраненные места */}
          {places.map(place => (
            <Marker
              key={place.id}
              position={[place.coordinates.latitude, place.coordinates.longitude]}
              icon={placeIcon}
            >
              <Popup>
                <b>{place.name}</b>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full shadow-lg absolute bottom-4 right-4 z-[1000]"
        >
          Обновить
        </button>
      </div>
    </div>
  );
}