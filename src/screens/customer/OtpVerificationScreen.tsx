import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/routes/RootNavigator';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type OtpVerificationRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
  
  const navigation = useNavigation<OtpVerificationNavigationProp>();
  const route = useRoute<OtpVerificationRouteProp>();
  const { phone } = route.params;
  const { verifyOtp, isLoading, login } = useAuth();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    } else if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleBlur = () => {
    setActiveIndex(null);
  };

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP');
      return;
    }

    const ok = await verifyOtp(phone, otpString);
    if (!ok) return;
  };

  const handleResendOtp = async () => {
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
    setActiveIndex(0);
    
    try {
      await login(phone);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={styles.content}>
        {/* Header with back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <MaterialIcons name="arrow-back" size={28} color="#4e73df" />
        </TouchableOpacity>

        {/* Verification Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to
          </Text>
          <Text style={styles.phoneText}>+{phone}</Text>
        </View>

        {/* OTP Input Container */}
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
                isLoading && styles.disabledInput
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              editable={!isLoading}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOtp}
          disabled={isLoading || otp.join('').length !== 4}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4e73df', '#224abe']}
            style={[
              styles.verifyButton,
              (isLoading || otp.join('').length !== 4) && styles.disabledButton
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

        {/* Resend OTP Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResendOtp} 
              disabled={isLoading}
            >
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCountdown}>
              Resend in <Text style={styles.resendCountdownBold}>{timer} seconds</Text>
            </Text>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    shadowColor: '#4e73df',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeOtpInput: {
    borderColor: '#4e73df',
    shadowOpacity: 0.2,
    transform: [{ scale: 1.05 }],
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
    shadowColor: '#4e73df',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
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
  resendCountdown: {
    color: '#a0aec0',
    fontSize: 16,
    marginTop: 4,
  },
  resendCountdownBold: {
    fontWeight: '700',
    color: '#4e73df',
  },
});

export default OtpVerificationScreen;