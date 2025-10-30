import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as Location from 'expo-location';
import LocationPickerScreen from './LocationPickerScreen';
import { Alert } from 'react-native';

jest.mock('expo-location');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('LocationPickerScreen', () => {
  it('should handle ERR_LOCATION_UNAVAILABLE error on initial load', async () => {
    const error: any = new Error('Location is unavailable. Please enable location services.');
    error.code = 'ERR_LOCATION_UNAVAILABLE';
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

    await act(async () => {
      render(<LocationPickerScreen />);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Location Unavailable',
      'Please enable location services to use this feature.',
      [
        { text: 'Cancel', style: 'cancel', onPress: expect.any(Function) },
        { text: 'Open Settings', onPress: expect.any(Function) },
      ]
    );
  });

  it('should handle ERR_LOCATION_UNAVAILABLE error on using current location', async () => {
    const error: any = new Error('Location is unavailable. Please enable location services.');
    error.code = 'ERR_LOCATION_UNAVAILABLE';
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock)
      .mockResolvedValueOnce({ coords: { latitude: 0, longitude: 0 } })
      .mockRejectedValue(error);

    const { getByTestId } = render(<LocationPickerScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('use-current-location-button'));
    });

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
