import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface AuthRequiredProps {
  children: React.ReactNode;
}

/**
 * A higher-order component that checks if the user is authenticated
 * and redirects to the login screen if not.
 */
const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    // Check if user is not authenticated or is a guest user (skip-user)
    if (!user || user.name === 'Guest User') {
      // Redirect to login screen
      navigation.navigate('Login' as never);
    }
  }, [user, navigation]);

  // If user is authenticated and not a guest, render the children
  if (user && user.name !== 'Guest User') {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default AuthRequired;