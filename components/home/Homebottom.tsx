import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AntDesign, FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme/color';
import { useRouter } from 'expo-router';
import { Fonts } from '@/theme/fonts';

const { width, height } = Dimensions.get('window');
const SWIPE_X_THRESHOLD = width * 0.3;
const SWIPE_Y_THRESHOLD = height * 0.25;

interface HomebottomProps {
  allusers: any[];
  profileSlice: { id: number };
  setActionState: (state: any) => void;
  actionState: any;
  onLoadMore: () => void;
  hasMore: boolean;
  isFetching: boolean;
  removeUser: (id: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const Homebottom: React.FC<HomebottomProps> = ({
  allusers,
  profileSlice,
  setActionState,
  actionState,
  onLoadMore,
  hasMore,
  isFetching,
  removeUser,
  onRefresh,
  refreshing,
}) => {
  const router = useRouter();
  const [users, setUsers] = useState(allusers);
  const [animating, setAnimating] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const loadMoreRequested = useRef(false);

  useEffect(() => {
    setUsers(allusers);
    if (allusers.length > 0) loadMoreRequested.current = false;
  }, [allusers]);

  useEffect(() => {
    if (users.length === 0 && hasMore && !isFetching && !loadMoreRequested.current) {
      loadMoreRequested.current = true;
      onLoadMore();
    }
  }, [users.length, hasMore, isFetching]);

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const animateOut = (x: number, y: number, action: 'like' | 'dislike' | 'superlike') => {
    const currentCard = users[0];
    if (animating || !currentCard) return;

    setAnimating(true);
    setActionState({
      type: action,
      loginUserId: profileSlice.id,
      currentUserId: currentCard.id,
    });

    Animated.timing(position, {
      toValue: { x, y },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      removeUser(currentCard.id);
      setUsers((prev) => prev.slice(1));
      setActionState(null);
      requestAnimationFrame(() => {
        position.setValue({ x: 0, y: 0 });
        setAnimating(false);
      });
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !animating,
        onMoveShouldSetPanResponder: () => !animating,
        onPanResponderMove: (_, gesture) => {
          if (animating) return;
          position.setValue({ x: gesture.dx, y: Math.min(gesture.dy, 150) });
        },
        onPanResponderRelease: (_, g) => {
          if (animating) return;
          if (g.dx > SWIPE_X_THRESHOLD) animateOut(width * 1.5, g.dy, 'like');
          else if (g.dx < -SWIPE_X_THRESHOLD) animateOut(-width * 1.5, g.dy, 'dislike');
          else if (g.dy < -SWIPE_Y_THRESHOLD) animateOut(0, -height, 'superlike');
          else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [users, animating],
  );

  if (users.length === 0)
    return (
      <View style={styles.emptyWrap}>
        {isFetching || refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={36} color={Colors.lightPink + '60'} />
            </View>
            <Text style={styles.emptyTitle}>No more profiles</Text>
            <Text style={styles.emptySub}>
              Check back soon — new people join every day!
            </Text>
            {onRefresh && (
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.85}>
                <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );

  const currentUser = users[0];
  const nextUser = users[1];

  return (
    <View style={styles.container}>
      {/* Next card (peeking behind) */}
      {nextUser && (
        <View key={`next-${nextUser.id}`} style={[styles.card, styles.nextCard]}>
          <Image source={{ uri: nextUser.avatar_url }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
        </View>
      )}

      {/* Current card */}
      {currentUser && (
        <Animated.View
          key={currentUser.id}
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
          {actionState?.currentUserId === currentUser.id &&
            actionState.type === 'like' && (
              <View style={[styles.labelWrap, styles.labelLeft]}>
                <Text style={[styles.labelText, { color: Colors.green }]}>LIKE</Text>
              </View>
            )}
          {actionState?.currentUserId === currentUser.id &&
            actionState.type === 'dislike' && (
              <View style={[styles.labelWrap, styles.labelRight]}>
                <Text style={[styles.labelText, { color: Colors.accent }]}>NOPE</Text>
              </View>
            )}
          {actionState?.currentUserId === currentUser.id &&
            actionState.type === 'superlike' && (
              <View style={[styles.labelWrap, styles.labelCenter]}>
                <Text style={[styles.labelText, { color: Colors.softPink }]}>
                  SUPER LIKE
                </Text>
              </View>
            )}

          <Image source={{ uri: currentUser.avatar_url }} style={styles.image} />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.85)']}
            locations={[0.4, 0.75, 1]}
            style={styles.gradient}
          >
            <View style={styles.cardInfo}>
              <View style={styles.cardInfoTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{currentUser.full_name}</Text>
                  <Text style={styles.cardProfession}>{currentUser.profession}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => router.push('userdetail')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="information-circle-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardMeta}>
                <Entypo name="location-pin" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.cardDistance}>{currentUser.distance_km}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSmall]}
          onPress={() => animateOut(-width * 1.5, 0, 'dislike')}
          activeOpacity={0.85}
        >
          <AntDesign name="close" size={24} color={Colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionLarge]}
          onPress={() => animateOut(0, -height, 'superlike')}
          activeOpacity={0.85}
        >
          <FontAwesome name="star" size={26} color={Colors.softPink} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSmall]}
          onPress={() => animateOut(width * 1.5, 0, 'like')}
          activeOpacity={0.85}
        >
          <AntDesign name="heart" size={24} color={Colors.green} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Homebottom;

const ACTION_ROW_HEIGHT = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: ACTION_ROW_HEIGHT + 8,
  },

  /* Cards */
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: ACTION_ROW_HEIGHT + 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.darkPlum,
  },
  nextCard: {
    zIndex: 0,
    transform: [{ scale: 0.96 }],
    top: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },

  /* Card info */
  cardInfo: {},
  cardInfoTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardName: {
    color: '#fff',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  cardProfession: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  detailBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 3,
  },
  cardDistance: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: Fonts.regular,
  },

  /* Swipe labels */
  labelWrap: {
    position: 'absolute',
    zIndex: 10,
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  labelLeft: {
    top: 50,
    left: 24,
    borderColor: Colors.green,
    transform: [{ rotate: '-15deg' }],
  },
  labelRight: {
    top: 50,
    right: 24,
    borderColor: Colors.accent,
    transform: [{ rotate: '15deg' }],
  },
  labelCenter: {
    top: height * 0.18,
    alignSelf: 'center',
    borderColor: Colors.softPink,
  },
  labelText: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    letterSpacing: 2,
  },

  /* Action buttons */
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ACTION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
  },
  actionSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionLarge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderColor: Colors.softPink + '30',
  },

  /* Empty state */
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    marginTop: 20,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
});
