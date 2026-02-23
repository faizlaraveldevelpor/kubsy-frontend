import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

interface User {
  images: any[];
  name: string;
  profession: string;
  about: string;
  interests: string[];
}

const user: User = {
  images: [
    require('../assets/images/user.jpg'),
    require('../assets/images/user.jpg'),
    require('../assets/images/user.jpg'),
  ],
  name: 'Sarah',
  profession: 'Designer',
  about:
    'I love design, travel, and photography. Always curious to learn new things.',
  interests: [
    'Art',
    'Travel',
    'Photography',
    'Music',
    'Art',
    'Travel',
    'Photography',
    'Music',
  ],
};

const Loginuserdetails = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const profileSlice=useSelector((state)=>state?.profileSlice?.userApi)
  console.log(profileSlice)
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* TOP IMAGE SLIDER */}
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {profileSlice.images.map((img, index) => (
            <Image
              key={index}
              source={{uri:img}}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* DOTS INDICATOR */}
        <View style={styles.dotsContainer}>
          {user.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* INFO CARD */}
      <View style={styles.infoContainer}>
        {/* NAME + EDIT */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.name}>{profileSlice.full_name}</Text>
            <Text style={styles.profession}>{profileSlice.profession}</Text>
          </View>

         
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionContent}>{profileSlice.about}</Text>
        </View>

        {/* INTERESTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>

          <View style={styles.interestsContainer}>
            {profileSlice?.interests?.length > 0 && profileSlice.interests.map((interest, index) => (
              <View key={index} style={styles.interestBadge}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Loginuserdetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  slider: {
    width: '100%',
    height: height * 0.6,
  },

  image: {
    width: width,
    height: height * 0.6,
  },

  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  dotsContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },

  infoContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 28,
    color: Colors.black,
    fontFamily: Fonts.medium,
  },

  profession: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 1,
    fontFamily: Fonts.regular,
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 6,
    color: Colors.black,
    fontFamily: Fonts.bold,
  },

  sectionContent: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },

  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },

  interestBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
  },

  interestText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});
