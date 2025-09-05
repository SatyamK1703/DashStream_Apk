import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routes/RootNavigator';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if user is authenticated and redirect to login if not.
 * This is useful for screens that require authentication.
 * 
 * @param shouldCheck - Whether to check authentication (default: true)
 * @returns The authentication status object
 */
export const useRequireAuth = (shouldCheck: boolean = true) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const isGuest = user?.id === 'skip-user';
  const isFullyAuthenticated = isAuthenticated && !isGuest;

  useEffect(() => {
    if (shouldCheck && (!isAuthenticated || isGuest)) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, isGuest, navigation, shouldCheck]);

  return { isAuthenticated, isGuest, isFullyAuthenticated, user };
};