import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/routes/RootNavigator';
import { useAuthStore } from '../../store';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type OtpVerificationRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OtpVerification'
>;

const OTP_LENGTH = 6; // Firebase OTPs are 6 digits

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const navigation = useNavigation<OtpVerificationNavigationProp>();
  const route = useRoute<OtpVerificationRouteProp>();
  const { phone } = route.params;
  const { confirmOtp, isLoading } = useAuthStore();

  // Auto-submit when all digits are filled
  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH && !otp.includes('') && !isLoading) {
      const id = setTimeout(() => handleVerifyOtp(), 100);
      return () => clearTimeout(id);
    }
  }, [otp, isLoading]);

  const focusField = (index: number) => {
    inputRefs.current[index]?.focus();
    setActiveIndex(index);
  };

  const handleOtpChange = (text: string, index: number) => {
    const digitsOnly = text.replace(/\D/g, '');

    if (digitsOnly.length === 0) {
      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = '';
        return updated;
      });
      return;
    }

    if (digitsOnly.length > 1) {
      setOtp((prev) => {
        const updated = [...prev];
        let i = index;
        for (let d of digitsOnly.split('').slice(0, OTP_LENGTH - index)) {
          updated[i] = d;
          i += 1;
        }
        return updated;
      });
      const nextIndex = Math.min(index + digitsOnly.length, OTP_LENGTH - 1);
      focusField(nextIndex);
      return;
    }

    setOtp((prev) => {
      const updated = [...prev];
      updated[index] = digitsOnly;
      return updated;
    });

    if (index < OTP_LENGTH - 1) {
      focusField(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        setOtp((prev) => {
          const updated = [...prev];
          updated[index - 1] = '';
          return updated;
        });
        focusField(index - 1);
      }
    }
  };

  const handleFocus = (index: number) => setActiveIndex(index);
  const handleBlur = () => setActiveIndex(null);

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', `Please enter a valid ${OTP_LENGTH}-digit OTP`);
      return;
    }
    const success = await confirmOtp(otpString);
    if (!success) {
      Alert.alert('Verification Failed', 'The OTP you entered is incorrect. Please try again.');
    }
    // On success, the auth store will set the user and navigate automatically
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={28} color="#4e73df" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>Enter the {OTP_LENGTH}-digit code sent to</Text>
            <Text style={styles.phoneText}>+91{phone}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  activeIndex === index && styles.activeOtpInput,
                  isLoading && styles.disabledInput,
                ]}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                editable={!isLoading}
                selectTextOnFocus
                importantForAutofill="yes"
                returnKeyType="done"
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={isLoading || otp.join('').length !== OTP_LENGTH}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4e73df', '#224abe']}
              style={[
                styles.verifyButton,
                (isLoading || otp.join('').length !== OTP_LENGTH) && styles.disabledButton,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
              <Text style={styles.resendLink}>Request a new one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  container: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4e73df',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  activeOtpInput: {
    borderColor: '#4e73df',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
  },
  verifyButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    color: '#718096',
    fontSize: 16,
    marginBottom: 4,
  },
  resendLink: {
    color: '#4e73df',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },
});

export default OtpVerificationScreen;