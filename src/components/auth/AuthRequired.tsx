import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/routes/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';

type AuthRequiredProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * A component that requires authentication to render its children.
 * If the user is not authenticated, it will navigate to the login screen.
 */
const AuthRequired: React.FC<AuthRequiredProps> = ({ children, fallback }) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  React.useEffect(() => {
    // If user is not authenticated and is a guest user (skip-user), redirect to login
    if (!isAuthenticated || (user && user.id === 'skip-user')) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation, user]);

  // If authenticated, render children
  // If not authenticated but fallback is provided, render fallback
  // Otherwise render null (nothing)
  if (isAuthenticated && (!user || user.id !== 'skip-user')) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

export default AuthRequired;