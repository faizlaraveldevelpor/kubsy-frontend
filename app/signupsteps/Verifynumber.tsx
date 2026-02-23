import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme/color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fonts } from '@/theme/fonts';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const { width, height: SCREEN_H } = Dimensions.get('window');

export default function Verifynumber() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const loginuserInfo = useSelector(
    (state: any) => state.profileSlice.userlogininfo
  );
  const inputRefs = useRef<TextInput[]>([]);

  const displayPhone = typeof phone === 'string' ? phone : loginuserInfo?.number || '';

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Error', 'Please enter 6-digit code');
      return;
    }

    // Dev bypass: skip API verification, always go to signup screens
    if (fullOtp === '000000') {
      router.replace('/signupsteps/Fillyourprofile');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        phone:
          typeof phone === 'string' && phone.startsWith('+')
            ? phone
            : `+92${loginuserInfo?.number}`,
        token: fullOtp,
        type: 'sms',
      });

      if (authError) throw authError;

      const user = data.user;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile || !profile.full_name) {
          router.replace('/signupsteps/Fillyourprofile');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Fixed header */}
      <LinearGradient
        colors={[Colors.background, Colors.darkPlum, Colors.wine]}
        style={styles.hero}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.heading}>Verify Code</Text>
        <Text style={styles.subHeading}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{displayPhone}</Text>
        </Text>
      </LinearGradient>

      {/* Form */}
      <View style={styles.formCard}>
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el!)}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (
                  nativeEvent.key === 'Backspace' &&
                  !otp[index] &&
                  index > 0
                ) {
                  inputRefs.current[index - 1].focus();
                }
              }}
              placeholderTextColor={Colors.gray}
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, loading && { opacity: 0.8 }]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.verifyText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={() => router.push('/startScreen')}
        >
          <Text style={styles.resendText}>
            Didn't receive code?{' '}
            <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fixed footer */}
      <View style={styles.footerWrap}>
        <Text style={styles.footerLegal}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    width,
    height: SCREEN_H * 0.25,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  formCard: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.wine,
    borderRadius: 14,
    backgroundColor: Colors.darkPlum,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  verifyText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  resendBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: Colors.gray,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  resendLink: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  footerWrap: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.wine + '40',
  },
  footerLegal: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
});
