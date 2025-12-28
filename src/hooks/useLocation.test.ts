import { renderHook, act } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useLocation } from './useLocation';
import { Alert } from 'react-native';

jest.mock('expo-location');
jest.spyOn(Alert, 'alert');

describe('useLocation', () => {
  it('should handle ERR_LOCATION_UNAVAILABLE error', async () => {
    const error: any = new Error('Location is unavailable. Please enable location services.');
    error.code = 'ERR_LOCATION_UNAVAILABLE';
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useLocation());

    await act(async () => {
      result.current.getCurrentLocation();
      await waitForNextUpdate();
    });

    expect(result.current.error).toBe('Location is unavailable. Please enable location services.');
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
