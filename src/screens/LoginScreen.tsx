// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../app/routes/RootNavigator';
// import { useAuth } from '../context/AuthContext';

// const LoginScreen = () => {
//   const [phone, setPhone] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const { login, setUser } = useAuth() as any;

//   const handleLogin = async () => {
//     if (!/^\d{10}$/.test(phone)) {
//       Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
//       return;
//     }
//     setIsLoading(true);
//     try {
//       console.log('Calling login...');
//       await login(phone);
//       console.log('Login success, navigating to OtpVerification');
//       navigation.navigate('OtpVerification', { phone });
//     } catch (error) {
//       console.log('Login error:', error);
//       Alert.alert('Login Failed', 'Could not send OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     setUser({
//       id: 'skip-user',
//       name: 'Guest User',
//       email: 'guest@example.com',
//       phone: '0000000000',
//       role: 'customer',
//       profileImage: undefined,
//     });
//      };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to DashStream</Text>
//       <Text style={styles.subtitle}>Sign in to continue</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter your phone number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         maxLength={10}
//         editable={!isLoading}
//       />
//       <TouchableOpacity
//         style={[styles.button, isLoading && { backgroundColor: '#ccc' }]}
//         onPress={handleLogin}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Send OTP</Text>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[styles.button, { backgroundColor: '#888', marginTop: 12 }]}
//         onPress={handleSkip}
//         disabled={isLoading}
//       >
//         <Text style={styles.buttonText}>Skip</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#2563eb',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#888',
//     marginBottom: 32,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     marginBottom: 24,
//     backgroundColor: '#fafafa',
//   },
//   button: {
//     width: '100%',
//     backgroundColor: '#2563eb',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default LoginScreen; 

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routes/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, setUser } = useAuth() as any;

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setIsLoading(true);
    try {
      await login(phone);
      navigation.navigate('OtpVerification', { phone });
    } catch (error) {
      Alert.alert('Login Failed', 'Could not send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setUser({
      id: 'skip-user',
      name: 'Guest User',
      email: 'guest@example.com',
      phone: '0000000000',
      role: 'customer',
      profileImage: undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/image.png')} // Replace with your logo
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to DashStream</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="phone" size={24} color="#7e8b9f" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#a0a7b5"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#4e73df', '#224abe']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSkip} disabled={isLoading}>
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            By continuing, you agree to our 
            <Text style={styles.link}> Terms</Text> and 
            <Text style={styles.link}> Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2d3748',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 8,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#4e73df',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#2d3748',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4e73df',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  skipText: {
    color: '#4e73df',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: '#4e73df',
    fontWeight: '600',
  },
});

export default LoginScreen;