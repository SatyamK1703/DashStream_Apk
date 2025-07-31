import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/routes/RootNavigator';
import { useAuth } from '../../context/AuthContext';

type OtpVerificationRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
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
      text = text[0]; // Only take the first character if multiple are pasted
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP');
      return;
    }

    const ok = await verifyOtp(phone, otpString); // returns true/false
  if (!ok) {
    // We already show an alert in verifyOtp when invalid, so you can skip extra alerts here
    return;
  }
  };

  const handleResendOtp = async () => {
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
    
    try {
      await login(phone); // Resend OTP
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
   <View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>Verification Code</Text>
    <Text style={styles.subtitle}>
      We have sent the verification code to{'\n'}
      <Text style={styles.phoneText}>+{phone}</Text>
    </Text>
  </View>

  {/* OTP Input */}
  <View style={styles.otpContainer}>
    {otp.map((digit, index) => (
      <TextInput
        key={index}
        ref={(ref) => {
          inputRefs.current[index] = ref;
        }}
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={1}
        value={digit}
        onChangeText={(text) => handleOtpChange(text, index)}
        onKeyPress={(e) => handleKeyPress(e, index)}
        editable={!isLoading}
      />
    ))}
  </View>

  {/* Verify Button */}
  <TouchableOpacity
    style={[styles.verifyButton, isLoading && styles.disabledButton]}
    onPress={handleVerifyOtp}
    disabled={isLoading || otp.join('').length !== 4}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color="white" />
    ) : (
      <Text style={styles.verifyButtonText}>Verify</Text>
    )}
  </TouchableOpacity>

  {/* Resend OTP */}
  <View style={styles.resendContainer}>
    <Text style={styles.resendText}>Didn't receive the code? </Text>
    {canResend ? (
      <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
        <Text style={styles.resendLink}>Resend</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.resendCountdown}>
        Resend in <Text style={styles.resendCountdownBold}>{timer}s</Text>
      </Text>
    )}
  </View>
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280', // gray-500
    textAlign: 'center',
  },
  phoneText: {
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, // Nativewind's space-x-4
    marginBottom: 32,
  },
  otpInput: {
    width: 56, // 14 * 4
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#2563eb', // primary
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af', // gray-400
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#6b7280', // gray-500
  },
  resendLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  resendCountdown: {
    color: '#9ca3af', // gray-400
  },
  resendCountdownBold: {
    fontWeight: '600',
  },
});


export default OtpVerificationScreen;