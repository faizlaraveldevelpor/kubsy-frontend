import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Colors } from '@/theme/color';
import { router } from 'expo-router';
import { Fonts } from '@/theme/fonts';
import { supabase } from '@/lib/supabase';
import { userlogininfo } from '@/store/profileSlice';
import { useDispatch } from 'react-redux';
import { signInWithOAuthProvider } from '@/services/Auth';
// OAuth uses makeRedirectUri(scheme: 'kubsy', path: 'auth-callback') in Auth.ts; redirect handled there.

const { width, height: SCREEN_H } = Dimensions.get('window');

const DEFAULT_COUNTRY_CODE: CountryCode = 'SL';
const DEFAULT_CALLING_CODE = '+232';

/** Country code (e.g. "US") to flag emoji */
function getFlagEmoji(cca2: string): string {
  if (!cca2 || cca2.length !== 2) return '🌐';
  return cca2
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('');
}

export default function StartScreen() {
  const safeTop = useSafeAreaTop();
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [callingCode, setCallingCode] = useState(DEFAULT_CALLING_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    try {
      const { error } = await signInWithOAuthProvider('google');
      if (error) {
        if (error) alert(error);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (!profile?.full_name) {
        router.replace('/signupsteps/Fillyourprofile');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      alert(e?.message ?? 'Google sign in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setOauthLoading('apple');
    try {
      const { error } = await signInWithOAuthProvider('apple');
      if (error) {
        alert(error);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (!profile?.full_name) {
        router.replace('/signupsteps/Fillyourprofile');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      alert(e?.message ?? 'Apple sign in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode('+' + (country.callingCode?.[0] ?? ''));
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // --- OTP Bhejne ka Function ---
  const handleSendOtp = async () => {
    // Dev bypass: skip all APIs and go straight to OTP screen
    if (phoneNumber === '00000') {
      dispatch(userlogininfo({ number: '+0000000000' }));
      router.push({
        pathname: "/signupsteps/Verifynumber",
        params: { phone: '+0000000000' }
      });
      return;
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      alert("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = (callingCode.startsWith('+') ? callingCode : '+' + callingCode) + digitsOnly;
      console.log(formattedPhone);
      
      // 1. Number se Profile search karke Auth ID nikalna
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, adminblock")
        .eq("phone", formattedPhone) // Ensure column name is correct
        .maybeSingle();

      // 2. Agar Profile (Auth ID) mil jaye, to conditions check karein
      if (profile) {
        const authId = profile.id; // Yeh aapki Auth ID hai

        // A: Check Admin Block
        if (profile.adminblock === true) {
          alert("Your account has been blocked by admin.");
          setLoading(false);
          return;
        }

        // B: Check Reports table using Auth ID
        const { data: report } = await supabase
          .from("reports")
          .select("status")
          .eq("reported_id", authId)
          .eq("status", true)
          .maybeSingle();

        if (report) {
          alert("Your account is suspended due to reports.");
          setLoading(false);
          return;
        }
      }

      // 3. Agar user blocked nahi hai, to OTP bhejein
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) throw otpError;

      dispatch(userlogininfo({ number: formattedPhone }));
      
      // Verify page par move karein
      router.push({
        pathname: "/signupsteps/Verifynumber", 
        params: { phone: formattedPhone }
      });
      
    } catch (error: any) {
      // 'invalid from number' error ke liye Supabase dashboard ki settings check karein
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header – shrinks when keyboard opens */}
      <ImageBackground
        source={require('../assets/images/bg-couple.png')}
        style={[styles.hero, { paddingTop: safeTop }, keyboardVisible && styles.heroSmall]}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[Colors.background + '70', Colors.darkPlum + '80', Colors.wine + '95']}
          style={styles.heroOverlay}
        >
          <View style={styles.brandBlock}>
            <Image
              source={require('../assets/images/logo.png')}
              style={[styles.logo, keyboardVisible && styles.logoSmall]}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Kubsy</Text>
            {!keyboardVisible && <Text style={styles.tagline}>Meet, Match, Kubsy</Text>}
          </View>

          {!keyboardVisible && (
            <>
              <View style={styles.featurePills}>
                <View style={styles.pill}>
                  <AntDesign name="heart" size={14} color={Colors.lightPink} />
                  <Text style={styles.pillText}>Real connections</Text>
                </View>
                <View style={styles.pill}>
                  <MaterialCommunityIcons name="hand-heart" size={14} color={Colors.lightPink} />
                  <Text style={styles.pillText}>Swipe & match</Text>
                </View>
                <View style={styles.pill}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.lightPink} />
                  <Text style={styles.pillText}>Safe & private</Text>
                </View>
              </View>
              <Text style={styles.socialProof}>Join people finding meaningful connections</Text>
            </>
          )}
        </LinearGradient>
      </ImageBackground>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.welcomeText}>Get your perfect match</Text>
        <Text style={styles.formSubtext}>Enter your number or sign in with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialButton, oauthLoading && { opacity: 0.7 }]}
            onPress={handleGoogleLogin}
            disabled={!!oauthLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={22} color={Colors.white} />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButton, oauthLoading && { opacity: 0.7 }]}
            onPress={handleAppleLogin}
            disabled={!!oauthLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={24} color={Colors.white} />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orDivider}>— or enter your number —</Text>

        <Text style={styles.phoneLabel}>Phone number</Text>
        <View style={styles.inputContainer}>
          <View style={styles.pickerWrapper} pointerEvents="box-none">
            <CountryPicker
              countryCode={countryCode}
              withFilter
              withCallingCode
              withEmoji
              withModal
              onSelect={onSelectCountry}
              theme={{ primaryColor: Colors.primary, onBackgroundTextColor: Colors.white, backgroundColor: Colors.darkPlum }}
              containerButtonStyle={styles.pickerButton}
              renderFlagButton={({ onOpen }) => (
                <TouchableOpacity onPress={onOpen} style={styles.pickerTrigger} activeOpacity={0.7}>
                  <Text style={styles.flagEmoji}>{getFlagEmoji(countryCode)}</Text>
                  <Text style={styles.prefixText}>{callingCode}</Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.softPink} style={styles.chevron} />
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.inputDivider} />
          <View style={styles.phoneInputWrapper}>
            <Ionicons name="call-outline" size={20} color={Colors.softPink} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithPrefix}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.gray}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(t) => setPhoneNumber(t.replace(/\D/g, ''))}
              maxLength={15}
              showSoftInputOnFocus={true}
              editable
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, loading && { opacity: 0.8 }]} 
          onPress={handleSendOtp}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Sending code…' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom text — hidden when keyboard is open */}
      {!keyboardVisible && (
        <View style={styles.footerWrap}>
          <View style={styles.trustRow}>
            <Ionicons name="lock-closed" size={14} color={Colors.gray} />
            <Text style={styles.trustText}>Your number is never shared with other users</Text>
          </View>
          <Text style={styles.footerLegal}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      )}
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
    height: SCREEN_H * 0.44,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroSmall: {
    height: SCREEN_H * 0.22,
  },
  heroImage: {
    top: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    flex: 1,
    width: '100%',
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  logoSmall: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 17,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.wine + '50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
  },
  socialProof: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.95,
    paddingBottom:9
  },
  formCard: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  formSubtext: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 16,
    height: 52,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.white,
  },
  orDivider: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.gray,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 20,
    minHeight: 58,
    overflow: 'hidden',
  },
  pickerWrapper: {
    flexShrink: 0,
  },
  pickerButton: {
    marginRight: 0,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 4,
    minWidth: 100,
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 6,
    opacity: 0.9,
  },
  prefixText: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  inputDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: Colors.wine,
    marginRight: 12,
    marginLeft: 4,
    borderRadius: 1,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithPrefix: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.white,
    fontFamily: Fonts.regular,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontFamily: Fonts.regular,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
  footerWrap: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  trustText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray,
  },
  footerLegal: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
});