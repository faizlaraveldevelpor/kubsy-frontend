import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchWhoLikedMe } from '@/services/Like';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip;

  const [likesData, setLikesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [errorLikes, setErrorLikes] = useState<string | null>(null);

  const getFriendlyErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (/network|fetch|connection|timeout|internet/i.test(msg)) {
      return "Couldn't load your likes. Check your connection.";
    }
    return 'Something went wrong. Please try again.';
  };

  const loadLikes = async (pageNum: number, isRefresh: boolean = false) => {
    if (!profileSlice?.id) return;
    if (isRefresh) setErrorLikes(null);
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetchWhoLikedMe(profileSlice.id, pageNum, 10);
      const newItems = response?.data || [];
      const metadata = response?.metadata;

      setTotalCount(metadata?.total_records || 0);
      setHasMore(metadata?.has_more ?? false);

      if (isRefresh) setLikesData(newItems);
      else setLikesData((prev) => [...prev, ...newItems]);
    } catch (error) {
      console.error('Error fetching likes:', error);
      if (isRefresh) {
        setErrorLikes(getFriendlyErrorMessage(error));
        setLikesData([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadLikes(1, true);
  }, [profileSlice?.id]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadLikes(nextPage);
    }
  };

  const renderItem = ({ item }: any) => {
    const isSuperLike = item.interaction_type === 'superlike';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={isPremium ? 0.8 : 1}
        onPress={() => {
          if (isPremium) router.push({ pathname: '/userdetail', params: { id: item.id } });
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
            blurRadius={isPremium ? 0 : 15}
          />
          {!isPremium && (
            <View style={styles.lockOverlay}>
              <MaterialCommunityIcons name="lock" size={18} color="#fff" />
            </View>
          )}
          {/* Like type indicator */}
          <View style={[styles.likeIndicator, isSuperLike ? styles.superLikeIndicator : styles.heartIndicator]}>
            {isSuperLike ? (
              <FontAwesome name="star" size={10} color="#fff" />
            ) : (
              <AntDesign name="heart" size={10} color="#fff" />
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {isPremium ? item.full_name : '••••••••'}
          </Text>
          <View style={[styles.typeBadge, isSuperLike ? styles.superBadgeBg : styles.likeBadgeBg]}>
            {isSuperLike ? (
              <FontAwesome name="star" size={10} color={Colors.softPink} />
            ) : (
              <AntDesign name="heart" size={10} color={Colors.green} />
            )}
            <Text style={[styles.typeText, { color: isSuperLike ? Colors.softPink : Colors.green }]}>
              {isSuperLike ? 'Super Liked you' : 'Liked you'}
            </Text>
          </View>
        </View>

        {/* Action */}
        {isPremium && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              router.push({ pathname: '/singlechat', params: { id: item.id } })
            }
          >
            <Ionicons name="chatbubble" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          {!loading && totalCount > 0 && (
            <Text style={styles.headerSub}>
              {totalCount} {totalCount === 1 ? 'person' : 'people'} liked you
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Ionicons name="options-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <BottomFilterDialog visible={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Content */}
      {loading && page === 1 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : errorLikes ? (
        <View style={styles.stateWrap}>
          <View style={styles.stateCircle}>
            <Ionicons name="cloud-offline-outline" size={40} color={Colors.lightPink + '50'} />
          </View>
          <Text style={styles.stateTitle}>{errorLikes}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadLikes(1, true)} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={likesData}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              likesData.length === 0 && styles.listContentEmpty,
            ]}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : (
                <View style={{ height: !isPremium ? 140 : 30 }} />
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.stateCircle}>
                  <Ionicons name="heart-outline" size={40} color={Colors.lightPink + '50'} />
                </View>
                <Text style={styles.stateTitle}>No likes yet</Text>
                <Text style={styles.stateSub}>
                  Keep swiping — when someone likes you, they'll show up here!
                </Text>
              </View>
            }
          />

          {/* Upsell overlay for non-premium users */}
          {!isPremium && (
            <LinearGradient
              colors={[
                Colors.background + '00',
                Colors.background + (likesData.length === 0 ? '40' : 'CC'),
                Colors.background,
                Colors.background,
              ]}
              locations={likesData.length === 0 ? [0, 0.5, 0.7, 1] : [0, 0.25, 0.45, 1]}
              style={styles.upgradeOverlay}
            >
              <View style={styles.upgradeCrownCircle}>
                <FontAwesome5 name="crown" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.upgradeTitle}>
                {totalCount > 0
                  ? `Unlock ${totalCount} ${totalCount === 1 ? 'Like' : 'Likes'}`
                  : 'See Who Likes You'}
              </Text>
              <Text style={styles.upgradeSub}>
                {totalCount > 0
                  ? 'See who swiped right on you and connect instantly.'
                  : 'Upgrade to Premium to see everyone who likes you.'}
              </Text>
              <TouchableOpacity
                style={styles.upgradeBtn}
                activeOpacity={0.9}
                onPress={() => router.push('/Getvip')}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeBtnGradient}
                >
                  <FontAwesome5 name="crown" size={14} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.upgradeBtnText}>Get Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
    marginTop: 2,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* List */
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkPlum,
    padding: 14,
    borderRadius: 20,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 29,
  },
  likeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.darkPlum,
  },
  heartIndicator: {
    backgroundColor: Colors.green,
  },
  superLikeIndicator: {
    backgroundColor: Colors.softPink,
  },

  /* Info */
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  likeBadgeBg: {
    backgroundColor: Colors.green + '18',
  },
  superBadgeBg: {
    backgroundColor: Colors.softPink + '18',
  },
  typeText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },

  /* Chat button */
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* States */
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 160,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  stateCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  stateSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 18,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  /* Upgrade overlay */
  upgradeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  upgradeCrownCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  upgradeSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '80',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  upgradeBtn: {
    borderRadius: 26,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  upgradeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    height: 52,
    borderRadius: 26,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
