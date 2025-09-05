// __tests__/screens/admin/LocationManagementScreen.test.tsx
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import LocationManagementScreen from '../../../src/screens/admin/LocationManagementScreen';
import { FirebaseAuthContext } from '../../../src/contexts/FirebaseAuthContext';
import { database } from '../../../src/config/firebase';
import { ref, onValue } from 'firebase/database';

// Mock Firebase
jest.mock('firebase/database');
jest.mock('../../../src/config/firebase', () => ({
  database: {},
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation: any = {
  navigate: mockNavigate,
};

// Mock Firebase Auth Context
const mockFirebaseAuthContext = {
  user: { uid: 'admin-user-id' },
  userRole: 'admin',
  isAuthenticated: true,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  error: null,
  loading: false,
};

// Mock professionals data
const mockProfessionals = [
  {
    id: 'prof-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    status: 'available',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: Date.now(),
      accuracy: 10,
    },
  },
  {
    id: 'prof-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '123-456-7891',
    status: 'busy',
    location: {
      latitude: 37.7750,
      longitude: -122.4195,
      timestamp: Date.now() - 60000,
      accuracy: 15,
    },
  },
  {
    id: 'prof-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '123-456-7892',
    status: 'offline',
    location: null,
  },
];

// Mock MapView component
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props: any) => {
    return <View testID="map-view" {...props} />;
  };
  const MockMarker = (props: any) => {
    return <View testID="map-marker" {...props} />;
  };
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

describe('LocationManagementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase onValue
    (onValue as jest.Mock).mockImplementation((ref, callback) => {
      // Simulate Firebase data
      callback({
        exists: () => true,
        val: () => ({
          'prof-1': {
            current: mockProfessionals[0].location,
            status: mockProfessionals[0].status,
          },
          'prof-2': {
            current: mockProfessionals[1].location,
            status: mockProfessionals[1].status,
          },
          'prof-3': {
            status: mockProfessionals[2].status,
          },
        }),
      });
      
      // Return unsubscribe function
      return jest.fn();
    });
    
    // Mock ref
    (ref as jest.Mock).mockReturnValue({});
  });

  const renderWithContext = () => {
    return render(
      <FirebaseAuthContext.Provider value={mockFirebaseAuthContext}>
        <LocationManagementScreen navigation={mockNavigation} />
      </FirebaseAuthContext.Provider>
    );
  };

  it('renders correctly with professionals data', async () => {
    // Mock fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfessionals),
    });
    
    const { getByTestId, getByText, queryAllByTestId } = renderWithContext();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Should show professionals in the list
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Bob Johnson')).toBeTruthy();
    
    // Should show status indicators
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Busy')).toBeTruthy();
    expect(getByText('Offline')).toBeTruthy();
    
    // Should show markers for professionals with location
    const markers = queryAllByTestId('map-marker');
    expect(markers.length).toBe(2); // Only 2 professionals have location data
  });

  it('filters professionals by search query', async () => {
    // Mock fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfessionals),
    });
    
    const { getByTestId, getByText, queryByText } = renderWithContext();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Enter search query
    const searchInput = getByTestId('search-input');
    await act(async () => {
      fireEvent.changeText(searchInput, 'John');
    });
    
    // Should show John but not Jane or Bob
    expect(getByText('John Doe')).toBeTruthy();
    expect(queryByText('Jane Smith')).toBeNull();
    expect(queryByText('Bob Johnson')).toBeNull();
  });

  it('filters professionals by status', async () => {
    // Mock fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfessionals),
    });
    
    const { getByTestId, getByText, queryByText } = renderWithContext();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Filter by busy status
    const busyFilter = getByTestId('filter-busy');
    await act(async () => {
      fireEvent.press(busyFilter);
    });
    
    // Should show Jane but not John or Bob
    expect(queryByText('John Doe')).toBeNull();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(queryByText('Bob Johnson')).toBeNull();
    
    // Filter by offline status
    const offlineFilter = getByTestId('filter-offline');
    await act(async () => {
      fireEvent.press(offlineFilter);
    });
    
    // Should show Bob but not John or Jane
    expect(queryByText('John Doe')).toBeNull();
    expect(queryByText('Jane Smith')).toBeNull();
    expect(getByText('Bob Johnson')).toBeTruthy();
  });

  it('shows professional details when a professional is selected', async () => {
    // Mock fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfessionals),
    });
    
    const { getByTestId, getByText, queryByTestId } = renderWithContext();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Select a professional
    const professionalItem = getByText('John Doe').closest('View');
    await act(async () => {
      fireEvent.press(professionalItem);
    });
    
    // Should show professional details
    expect(getByTestId('professional-details')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByText('123-456-7890')).toBeTruthy();
    
    // Close details
    const closeButton = getByTestId('close-details-button');
    await act(async () => {
      fireEvent.press(closeButton);
    });
    
    // Details should be closed
    expect(queryByTestId('professional-details')).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    // Mock fetch API with error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const { getByText, queryByTestId } = renderWithContext();
    
    // Wait for error to appear
    await waitFor(() => {
      expect(getByText('Error loading professionals')).toBeTruthy();
    });
    
    // Should show retry button
    expect(getByText('Retry')).toBeTruthy();
    
    // Map should not be visible
    expect(queryByTestId('map-view')).toBeNull();
    
    // Mock successful fetch for retry
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfessionals),
    });
    
    // Press retry button
    const retryButton = getByText('Retry');
    await act(async () => {
      fireEvent.press(retryButton);
    });
    
    // Should load data successfully
    await waitFor(() => {
      expect(queryByTestId('map-view')).toBeTruthy();
    });
  });

  it('redirects non-admin users', async () => {
    // Mock non-admin user
    const nonAdminContext = {
      ...mockFirebaseAuthContext,
      userRole: 'professional',
    };
    
    // Render with non-admin context
    render(
      <FirebaseAuthContext.Provider value={nonAdminContext}>
        <LocationManagementScreen navigation={mockNavigation} />
      </FirebaseAuthContext.Provider>
    );
    
    // Should navigate to Home
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
});