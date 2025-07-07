'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useRef, useEffect, useState } from 'react';
import { Place } from '@/components/MapPage';

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
  selectedPlace: Place | null;
}

export default function MapComponent({
  userLocation,
  places,
  onPlaceClick,
  selectedPlace
}: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(userLocation);

  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      const { latitude, longitude } = selectedPlace.coordinates;
      mapRef.current.flyTo([latitude, longitude], 15);
    }
  }, [selectedPlace]);

  const centerOnUser = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation([lat, lng]);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 13);
        }
      },
      (err) => {
        alert('Ошибка получения местоположения');
        console.error(err);
      }
    );
  };

  return (
    <div className="flex-1 relative w-2/3">
      <MapContainer
        center={currentLocation}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <Marker position={currentLocation} icon={userIcon}>
          <Popup>Вы здесь!</Popup>
        </Marker>

        {places.map(place => (
          <Marker
            key={place.id}
            position={[place.coordinates.latitude, place.coordinates.longitude]}
            icon={selectedPlace?.id === place.id ? selectedIcon : placeIcon}
            eventHandlers={{ click: () => onPlaceClick(place) }}
          >
            <Popup>
              <b>{place.name}</b>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button
        onClick={centerOnUser}
        className="absolute bottom-4 right-4 z-[9999] bg-white text-sm px-4 py-2 rounded shadow hover:bg-blue-100"
      >
        📍
      </button>
    </div>
  );
}
