'use client';
import { GeoPoint } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/components/MapPage';

const selectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng);
    },
  });
  return null;
}

interface EditPlaceFormProps {
  place: Place;
  onClose: () => void;
  onSave: (updatedPlace: {
    id: string;
    name: string;
    coordinates: GeoPoint;
    description?: string;
  }) => void;
}

export default function EditPlaceForm({ place, onClose, onSave }: EditPlaceFormProps) {
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description || '');
  const [selectedLocation, setSelectedLocation] = useState({
    lat: place.coordinates.latitude,
    lng: place.coordinates.longitude
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<L.Map>(null);

  const handleMapClick = (latlng: L.LatLng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        id: place.id,
        name,
        coordinates: new GeoPoint(selectedLocation.lat, selectedLocation.lng),
        description: description || undefined
      });
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

return (
  <div className="fixed inset-0 flex items-center justify-center z-[1000] shadow-xl">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Редактировать место</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-6  max-w-xl">
          {/* Левая часть - форма (остается flex-col) */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Название места*</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-4 flex-grow">
              <label className="block mb-2">Описание</label>
              <textarea
                className="w-full p-2 border rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded cursor-pointer"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          {/* Правая часть - карта */}
          <div className="flex-1 h-full w-full "> 
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={13}
              className="h-full max-h-[350px] w-full rounded-lg border"
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={selectIcon}
              />
              <MapClickHandler onClick={handleMapClick} />
            </MapContainer>
          </div>
        </div>
      </form>
    </div>
  </div>
);
}