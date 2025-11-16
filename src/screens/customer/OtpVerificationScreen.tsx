import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';

const OTP_LENGTH = 4;

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const navigation = useNavigation();
  const { phone } = useRoute().params;
  const { verifyOtp, login, isLoading } = useAuth();

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH && !otp.includes('') && !isLoading) {
      setTimeout(() => verifyOtp(phone, code), 120);
    }
  }, [otp]);

  const handleOtpChange = (text, index) => {
    const clean = text.replace(/\D/g, '');
    if (!clean) {
      setOtp((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }

    if (clean.length > 1) {
      const array = [...otp];
      let pos = index;

      clean
        .split('')
        .slice(0, OTP_LENGTH - index)
        .forEach((d) => {
          array[pos] = d;
          pos++;
        });
      setOtp(array);
      if (pos < OTP_LENGTH) inputRefs.current[pos]?.focus();
      return;
    }

    const updated = [...otp];
    updated[index] = clean;
    setOtp(updated);

    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const resendOtp = async () => {
    setTimer(30);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    await login(phone);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#3B49DF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>We sent a code to</Text>
          <Text style={styles.phone}>+{phone}</Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputRefs.current[i] = ref)}
              value={digit}
              style={styles.otpBox}
              maxLength={1}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              onChangeText={(text) => handleOtpChange(text, i)}
              selectTextOnFocus
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
            />
          ))}
        </View>

        <TouchableOpacity
          disabled={isLoading || otp.includes('')}
          onPress={() => verifyOtp(phone, otp.join(''))}>
          <LinearGradient
            colors={['#4e73df', '#224abe']}
            style={[styles.button, (isLoading || otp.includes('')) && styles.buttonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.resendBox}>
          {canResend ? (
            <TouchableOpacity disabled={isLoading} onPress={resendOtp}>
              <Text style={styles.resend}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timer}>Resend in {timer}s</Text>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  wrapper: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 10,
    padding: 6,
    zIndex: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  phone: {
    fontSize: 18,
    color: '#3B49DF',
    fontWeight: '700',
    marginTop: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 32,
  },
  otpBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: '#CBD5E0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
    elevation: 3,
  },
  button: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  resendBox: {
    alignItems: 'center',
  },
  resend: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B49DF',
    padding: 10,
  },
  timer: {
    fontSize: 16,
    color: '#A0AEC0',
  },
});

export default OtpVerificationScreen;
