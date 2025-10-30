import * as Location from 'expo-location';
import { useLocationStore } from './locationStore';
import { Alert } from 'react-native';

jest.mock('expo-location');
jest.spyOn(Alert, 'alert');

describe('locationStore', () => {
  it('should handle ERR_LOCATION_UNAVAILABLE error on updateCurrentLocation', async () => {
    const error: any = new Error('Location is unavailable. Please enable location services.');
    error.code = 'ERR_LOCATION_UNAVAILABLE';
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

    await useLocationStore.getState().updateCurrentLocation();

    expect(useLocationStore.getState().error).toBe('Location is unavailable. Please enable location services.');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Location Unavailable',
      'Please enable location services to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: expect.any(Function) },
      ]
    );
  });
});
