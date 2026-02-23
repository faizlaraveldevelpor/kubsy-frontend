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
        <View style={styles.content}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Kubsy</Text>
          <Text style={styles.tagline}>Meet, Match, Kubsy</Text>

          <View style={styles.pills}>
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
        </View>

        <View style={styles.bottom}>
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginBottom: 14 }} />
          <Text style={styles.loadingText}>Finding your perfect match…</Text>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 18,
  },
  appName: {
    fontSize: 48,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 17,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
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
  },
  loadingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
  },
});
