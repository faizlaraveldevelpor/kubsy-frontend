import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';
import { router, useRouter } from 'expo-router';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

const { width } = Dimensions.get('window');

// ❤️ Perfect smoother heart profile
const HeartProfile = ({ image }: { image: string }) => {
  const router=useRouter()
  return (
    <Svg width={180} height={170} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="heartClip">
          <Path d="M256 480C256 480 32 336 32 176C32 88 104 32 176 32C224 32 256 72 256 72C256 72 288 32 336 32C408 32 480 88 480 176C480 336 256 480 256 480Z" />
        </ClipPath>
      </Defs>

      <SvgImage
        href={{ uri: image }}
        width="512"
        height="512"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#heartClip)"
      />

      <Path
        d="M256 480C256 480 32 336 32 176C32 88 104 32 176 32C224 32 256 72 256 72C256 72 288 32 336 32C408 32 480 88 480 176C480 336 256 480 256 480Z"
        fill="none"
        stroke="#9B4DFF"
        strokeWidth="22"
      />
    </Svg>
  );
};

export default function Yourmatch() {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={()=>router.back()}>
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </TouchableOpacity>

      {/* Match Area */}
      <View style={styles.matchWrap}>
        {/* Left Heart */}
        <View style={[styles.heartPos, { left: width / 2 - 190 }]}>
          <HeartProfile image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e" />
        </View>

        {/* Right Heart */}
        <View style={[styles.heartPos, { left: width / 2 - 5 }]}>
          <HeartProfile image="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e" />
        </View>

        {/* 💜 Small Hearts spread wider & more */}
        <Text style={[styles.smallHeart, { top: -30, left: 10 }]}>💜</Text>
        <Text style={[styles.smallHeart, { top: 0, left: 140 }]}>💜</Text>
        <Text style={[styles.smallHeart, { top: 90, left: -25 }]}>💜</Text>
        <Text style={[styles.smallHeart, { bottom:20, left: 10 }]}>💜</Text>
        <Text style={[styles.smallHeart, { bottom: 50, left: 160 }]}>💜</Text>

        <Text style={[styles.smallHeart, { top: -20, right: 10 }]}>💜</Text>
        <Text style={[styles.smallHeart, { top: 80, right: -25 }]}>💜</Text>
        <Text style={[styles.smallHeart, { bottom: 90, right: 25 }]}>💜</Text>
        <Text style={[styles.smallHeart, { bottom: 10, right: 120 }]}>💜</Text>

        {/* Percentage */}
        <View style={styles.percentCircle}>
          <Text style={styles.percent}>100%</Text>
        </View>
      </View>

      {/* Text */}
      <Text style={styles.title}>It's a Match</Text>
      <Text style={styles.subtitle}>Don't keep her waiting, say hello now!</Text>

      {/* Say Hello */}
      <LinearGradient colors={["#8E2BFF", "#C24CFF"]} style={styles.primaryBtn}>
        <TouchableOpacity>
          <Text style={styles.primaryText}>Say Hello</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Keep Swiping */}
      <TouchableOpacity style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>Keep Swiping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0F14',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchWrap: {
    marginTop: 140,
    width: width,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartPos: {
    position: 'absolute',
    
  },
  smallHeart: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.85,
  },
  percentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#9B4DFF',
    zIndex: 20,
  },
  percent: {
    fontWeight: '700',
  },
  title: {
    marginTop: 40,
    fontSize: 34,
    color: Colors.primary,
    fontFamily:Fonts.bold
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#CFCFCF',
    fontFamily:Fonts.regular

  },
  primaryBtn: {
    marginTop: 44,
    width: '85%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 18,
    fontFamily:Fonts.bold

  },
  secondaryBtn: {
    marginTop: 16,
    width: '85%',
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: '#2A2B34',
    alignItems: 'center',
    fontFamily:Fonts.bold

  },
  secondaryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily:Fonts.bold

  },
});