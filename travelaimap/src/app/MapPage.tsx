'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  GeoPoint,
  doc,
  deleteDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import MapComponent from '@/components/Map';
import PlacesList from '@/components/PlaceList';
import AddNewPlace from '@/components/AddNewPlace';
import { getCityName } from '@/lib/geocoding';
import { fetchAIRecommendations } from '@/lib/recommendation';

export interface Place {
  id?: string;
  name: string;
  coordinates: GeoPoint;
  description?: string;
  city?: string;
  userId?: string;
}

interface TravelMapPageProps {
  showForm: boolean;
  setShowForm: (val: boolean) => void;
}

export default function TravelMapPage({ showForm, setShowForm }: TravelMapPageProps) {
  const [userLocation, setUserLocation] = useState<[number, number]>([54.98, 82.89]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [recommendationsNearby, setRecommendationsNearby] = useState<Place[]>([]);
  const [recommendationsSimilar, setRecommendationsSimilar] = useState<Place[]>([]);

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

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
          collection(db, 'places'),
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        const placesWithCities = querySnapshot.docs.map((docSnap) => {
          const placeData = docSnap.data();

          return {
            id: docSnap.id,
            name: placeData.name,
            coordinates: placeData.coordinates,
            description: placeData.description,
            city: placeData.city,
            userId: placeData.userId
          };
        });

        setPlaces(placesWithCities);

        // AI-рекомендации
        const { nearby, similar } = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPlaces: placesWithCities, userLocation })
        }).then(res => res.json());

        setRecommendationsNearby(nearby);
        setRecommendationsSimilar(similar);

      } catch (err) {
        setError('Ошибка загрузки мест');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      loadPlaces();
    }
  }, [userLocation]);

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

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Не удалось получить пользователя');

      await addDoc(collection(db, 'places'), {
        ...placeData,
        city,
        userId
      });

      setShowForm(false);
      setLoading(true); // триггер повторной загрузки
    } catch (error) {
      setError('Ошибка при добавлении места');
      console.error(error);
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    try {
      await deleteDoc(doc(db, 'places', placeId));
      setPlaces(places.filter((place) => place.id !== placeId));
      setSelectedPlace(null);
    } catch (error) {
      setError('Ошибка при удалении места');
      console.error(error);
    }
  };

  const handleUpdatePlace = async (updatedPlace: Place) => {
    try {
      await updateDoc(doc(db, 'places', updatedPlace.id!), {
        name: updatedPlace.name,
        coordinates: updatedPlace.coordinates,
        description: updatedPlace.description
      });

      const updatedPlaces = places.map((place) =>
        place.id === updatedPlace.id ? { ...updatedPlace, city: place.city } : place
      );

      setPlaces(updatedPlaces);

      if (selectedPlace && selectedPlace.id === updatedPlace.id) {
  setSelectedPlace({ ...updatedPlace, city: selectedPlace.city });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-lg">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
      <MapComponent
        userLocation={userLocation}
        places={[...places, ...recommendationsNearby, ...recommendationsSimilar]}
        onPlaceClick={setSelectedPlace}
        showForm={showForm}
        onShowForm={setShowForm}
        selectedPlace={selectedPlace}
      />

      <PlacesList
        places={places}
        recommendationsNearby={recommendationsNearby}
        recommendationsSimilar={recommendationsSimilar}
        selectedPlace={selectedPlace}
        onSelectPlace={setSelectedPlace}
        onDeletePlace={handleDeletePlace}
        onUpdatePlace={handleUpdatePlace}
      />

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
