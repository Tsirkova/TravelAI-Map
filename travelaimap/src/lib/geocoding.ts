export const getCityName = async (lat: number, lng: number): Promise<string> => {
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