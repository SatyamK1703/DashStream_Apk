// src/services/mapService.ts
// Stub for map/geolocation service

export const getCurrentLocation = async () => {
  // TODO: Implement geolocation fetch
  return Promise.resolve({ lat: 0, lng: 0 });
};

export const getAddressFromCoords = async (lat: number, lng: number) => {
  // TODO: Implement reverse geocoding
  return Promise.resolve('Sample Address');
}; 