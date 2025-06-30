'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, GeoPoint, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MapComponent from '@/components/Map';
import PlacesList from '@/components/PlaceList';
import AddNewPlace from '@/components/AddNewPlace';
import { getCityName } from '@/lib/geocoding';

export interface Place {
  id: string;
  name: string;
  coordinates: GeoPoint;
  description?: string;
  city?: string;
}

export default function TravelMapPage() {
  const [userLocation, setUserLocation] = useState<[number, number]>([54.98, 82.89]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Получение текущего местоположения пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          setError(`Геолокация: ${err.message}`);
          setLoading(false);
        }
      );
    } else {
      setError('Геолокация не поддерживается');
      setLoading(false);
    }
  }, []);

  // Загрузка мест из Firestore
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'places'));
        const placesWithCities = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
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
    
    if (userLocation) {
      loadPlaces();
    }
  }, [userLocation]);

  // Добавление нового места
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
        querySnapshot.docs.map(async (doc) => {
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
      setShowForm(false);
    } catch (error) {
      setError('Ошибка при добавлении места');
      console.error(error);
    }
  };

  // Удаление места
  const handleDeletePlace = async (placeId: string) => {
    try {
      await deleteDoc(doc(db, 'places', placeId));
      setPlaces(places.filter(place => place.id !== placeId));
      setSelectedPlace(null);
    } catch (error) {
      setError('Ошибка при удалении места');
      console.error(error);
    }
  };

  // Обновление места
  const handleUpdatePlace = async (updatedPlace: Place) => {
    try {
      // Обновляем в Firestore
      await updateDoc(doc(db, 'places', updatedPlace.id), {
        name: updatedPlace.name,
        coordinates: updatedPlace.coordinates,
        description: updatedPlace.description
      });
      
      // Получаем обновленный город
      const city = await getCityName(
        updatedPlace.coordinates.latitude,
        updatedPlace.coordinates.longitude
      );
      
      // Обновляем локальное состояние
      const updatedPlaces = places.map(place => 
        place.id === updatedPlace.id ? {
          ...updatedPlace,
          city: city
        } : place
      );
      
      setPlaces(updatedPlaces);
      
      // Если редактировали выбранное место - обновляем его
      if (selectedPlace?.id === updatedPlace.id) {
        setSelectedPlace({
          ...updatedPlace,
          city: city
        });
      }
    } catch (error) {
      setError('Ошибка при обновлении места');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TravelAI Map</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Добавить место
          </button>
        </div>
        {error && (
          <div className="container mx-auto mt-2">
            <p className="text-yellow-200 text-sm">{error}</p>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <MapComponent 
          userLocation={userLocation}
          places={places}
          onPlaceClick={setSelectedPlace}
          showForm={showForm}
          onShowForm={setShowForm}
          selectedPlace={selectedPlace}
        />
        
        <PlacesList 
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          onDeletePlace={handleDeletePlace}
          onUpdatePlace={handleUpdatePlace}
        />
      </div>

      {showForm && (
        <AddNewPlace
          onClose={() => setShowForm(false)}
          onAdd={handleAddPlace}
          userLocation={{ lat: userLocation[0], lng: userLocation[1] }}
        />
      )}
    </div>
  );
}