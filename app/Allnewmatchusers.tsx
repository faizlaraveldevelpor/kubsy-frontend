import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { fetchProfiles } from '@/services/Profile';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 18 * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

const calculateAge = (dob: string) => {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const NewMatchPage = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchData = async (pageNum: number) => {
    if (!profileSlice?.id) return;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetchProfiles(profileSlice.id, {
        page: pageNum,
        limit: 10,
        minAge: filterage?.length > 0 ? filterage[0] : 18,
        maxAge: filterage?.length > 0 ? filterage[1] : 40,
        maxDistance: 100,
        genderFilter: profileSlice.gender,
        professionFilter: [profileSlice.profession],
        userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests,
        userLat: profileSlice.latitude,
        userLon: profileSlice.longitude,
        cetagory: (profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
      });

      const data = res?.data || [];
      const normalized = data.map((u: any) => ({
        id: u.id,
        full_name: u.full_name || 'Unknown',
        profession: u.profession || 'N/A',
        avatar_url: u.avatar_url || 'https://placehold.co/400x400',
        age: u.dob ? calculateAge(u.dob) : 'N/A',
      }));

      if (normalized.length === 0) {
        setHasMore(false);
      } else {
        setMatches((prev) => {
          if (pageNum === 1) return normalized;
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNew = normalized.filter((item: any) => !existingIds.has(item.id));
          if (uniqueNew.length === 0) setHasMore(false);
          return [...prev, ...uniqueNew];
        });
      }
    } catch (error) {
      console.log('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [profileSlice?.id, filterintrests, filterage]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push('Yourmatch')}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.cardGradient}
      >
        <Text style={styles.cardName} numberOfLines={1}>
          {item.full_name}{item.age !== 'N/A' ? `, ${item.age}` : ''}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name="briefcase-outline" size={11} color="rgba(255,255,255,0.7)" />
          <Text style={styles.cardProfession} numberOfLines={1}>{item.profession}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Match</Text>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('Searchuser')}
        >
          <Ionicons name="search-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Count */}
      {!loading && matches.length > 0 && (
        <Text style={styles.countText}>{matches.length} people near you</Text>
      )}

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : <View style={{ height: 30 }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={40} color={Colors.lightPink + '50'} />
              </View>
              <Text style={styles.emptyTitle}>No profiles found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or check back later.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default NewMatchPage;

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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Count */
  countText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },

  /* Grid */
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  /* Cards */
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cardName: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardProfession: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },

  /* Loader */
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Empty */
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
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
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    textAlign: 'center',
  },
});
