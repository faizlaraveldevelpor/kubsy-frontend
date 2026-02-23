import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 90;

const initialUsers = [
  { id: 1, image: require('../assets/images/user.jpg'), name: 'Sarah', profession: 'Designer', distance: '2 km away' },
  { id: 2, image: require('../assets/images/user2.jpg'), name: 'John', profession: 'Developer', distance: '5 km away' },
  { id: 3, image: require('../assets/images/user.jpg'), name: 'Alice', profession: 'Engineer', distance: '3 km away' },
  { id: 4, image: require('../assets/images/user2.jpg'), name: 'Bob', profession: 'Artist', distance: '1 km away' },
];

const SWIPE_X_THRESHOLD = width * 0.3;
const SWIPE_Y_THRESHOLD = height * 0.25;

const Showmore = () => {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [animating, setAnimating] = useState(false);




   const position = useRef(new Animated.ValueXY()).current;
  
    const rotate = position.x.interpolate({
      inputRange: [-width, 0, width],
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });
  
    const resetPosition = () => {
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    };
  
    const animateOut = (x: number, y: number) => {
      if (animating || users.length === 0) return;
  
      setAnimating(true);
  
      Animated.timing(position, {
        toValue: { x, y },
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        // Remove top user safely
        setUsers(prev => prev.slice(1));
  
        // Reset position & animation state in next frame to avoid flick-back
        requestAnimationFrame(() => {
          position.setValue({ x: 0, y: 0 });
          setAnimating(false);
        });
      });
    };
  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !animating,
        onMoveShouldSetPanResponder: () => !animating,
  
        onPanResponderMove: (_, gesture) => {
          if (animating) return;
  
          position.setValue({
            x: gesture.dx,
            y: Math.min(gesture.dy, 150),
          });
        },
  
        onPanResponderRelease: (_, g) => {
          if (animating) return;
  
          if (g.dx > SWIPE_X_THRESHOLD) {
            animateOut(width * 1.2, g.dy);
          } else if (g.dx < -SWIPE_X_THRESHOLD) {
            animateOut(-width * 1.2, g.dy);
          } else if (g.dy < -SWIPE_Y_THRESHOLD) {
            animateOut(0, -height);
          } else {
            resetPosition();
          }
        },
      })
    ).current;
  
    if (users.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.endText}>No more profiles</Text>
        </View>
      );
    }
  
    const currentUser = users[0];
    const nextUser = users[1];





  
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* CARDS */}
      <View style={styles.cardArea}>

        {nextUser && (
          <View style={[styles.card, { zIndex: 0 }]}>
            <Image source={nextUser.image} style={styles.image} />
          </View>
        )}

        {currentUser && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                zIndex: 1,
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
          >
            <Image source={currentUser.image} style={styles.image} />
            <LinearGradient
              colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]}
              style={styles.gradient}
            >
              <View style={styles.info}>
                <View>
                  <Text style={styles.name}>{currentUser.name}</Text>
                  <Text style={styles.profession}>{currentUser.profession}</Text>
                </View>
                <View style={styles.row}>
                  <Entypo name="location-pin" size={18} color="#fff" />
                  <Text style={styles.distance}>{currentUser.distance}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

      </View>

      {/* ACTION BUTTONS */}
    

      {/* BOTTOM BACK BUTTON */}
      <TouchableOpacity style={styles.bottomBackBtn} onPress={() => router.back()}>
        <Text style={styles.bottomBackText}>Back</Text>
      </TouchableOpacity>

    </View>
  );
};

export default Showmore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal:10
  },

  header: {
    height: HEADER_HEIGHT,
    backgroundColor: Colors.background,
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardArea: {
    flex: 1,
    alignItems: 'center',
  },

  card: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop:20
  },

  image: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    padding: 16,
  },

  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  name: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.medium,
  },

  profession: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },

  distance: {
    color: Colors.white,
    fontSize: 16,
    fontFamily:Fonts.regular
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
  },

  iconBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomBackBtn: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    width:"100%"
  },

  bottomBackText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
    textAlign:"center"
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  endText: { fontSize: 22, fontWeight: '600', color:Colors.white },
});
