import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

const { width, height } = Dimensions.get('window');
const isShortScreen = height < 640;

export default function SplashView() {
  return (
    <ImageBackground
      source={require('@/assets/images/bg-couple.png')}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[Colors.background + '60', Colors.darkPlum + '80', Colors.background + 'F0', Colors.background]}
        locations={[0, 0.35, 0.65, 1]}
        style={styles.overlay}
      >
        <View style={styles.content} collapsable={false}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={[styles.logo, isShortScreen && styles.logoSmall]}
            resizeMode="contain"
          />
          <View style={styles.appNameWrap}>
            <Text style={styles.appName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              Kubsy
            </Text>
          </View>
          <View style={styles.taglineWrap}>
            <Text
              style={[styles.tagline, isShortScreen && styles.taglineSmall]}
              numberOfLines={2}
              allowFontScaling
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              Meet, Match, Kubsy
            </Text>
          </View>

          <View style={[styles.pills, isShortScreen && styles.pillsSmall]}>
            <View style={styles.pill}>
              <AntDesign name="heart" size={14} color={Colors.lightPink} />
              <Text style={styles.pillText} numberOfLines={1}>Real connections</Text>
            </View>
            <View style={styles.pill}>
              <MaterialCommunityIcons name="hand-heart" size={14} color={Colors.lightPink} />
              <Text style={styles.pillText} numberOfLines={1}>Swipe & match</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.lightPink} />
              <Text style={styles.pillText} numberOfLines={1}>Safe & private</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom} collapsable={false}>
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginBottom: 14 }} />
          <Text style={styles.loadingText} numberOfLines={1}>Finding your perfect match…</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width,
    height,
  },
  bgImage: {
    top: 40,
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  content: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'visible',
    minHeight: 200,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 18,
  },
  logoSmall: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  appNameWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  appName: {
    fontSize: 42,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  taglineWrap: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 6,
    alignItems: 'center',
    minHeight: 44,
  },
  tagline: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  taglineSmall: {
    fontSize: 14,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
  },
  pillsSmall: {
    marginTop: 18,
    gap: 8,
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
  bottom: {
    alignItems: 'center',
    paddingBottom: 60,
    flexShrink: 0,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
  },
});
