import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { fetchProfiles } from '@/services/Profile';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 18 * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.35;
const PLACEHOLDER_AVATAR = 'https://placehold.co/400x400';

const Searchuser = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [open, setOpen] = useState(false);
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterdistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const genderfilter = useSelector((state: any) => state?.profileSlice?.genderfilter);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (!profileSlice?.id) {
      setLoading(false);
      return;
    }
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await fetchProfiles(
        profileSlice.id,
        {
          minAge: filterage?.length > 0 ? filterage[0] : 18,
          maxAge: filterage?.length > 0 ? filterage[1] : 50,
          maxDistance: filterdistance?.length > 0 ? filterdistance[1] : 100,
          genderFilter: genderfilter ?? undefined,
          professionFilter: profileSlice.profession ? [profileSlice.profession] : [],
          userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests || [],
          cetagory: (profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
        },
        pageNum,
      );

      if (res?.data) {
        const list = res.data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          avatar_url: u.avatar_url || PLACEHOLDER_AVATAR,
        }));
        setUsers(prev => (isRefresh ? list : [...prev, ...list]));
        setHasMore(res.metadata?.has_more ?? false);
        setPage(pageNum);
      } else if (res === 'Daily swipe limit reached.') {
        setHasMore(false);
        if (isRefresh) setUsers([]);
      } else {
        setError('Could not load users');
        if (isRefresh) setUsers([]);
      }
    } catch (err) {
      setError('Could not load users');
      if (isRefresh) setUsers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [profileSlice?.id, filterage, filterdistance, genderfilter, filterintrests]);

  useEffect(() => {
    if (profileSlice?.id) {
      loadProfiles(1, true);
    } else {
      setLoading(false);
    }
  }, [profileSlice?.id]);

  useEffect(() => {
    if (profileSlice?.id && (filterage !== undefined || filterdistance !== undefined || genderfilter !== undefined || filterintrests !== undefined)) {
      loadProfiles(1, true);
    }
  }, [filterage, filterdistance, genderfilter, filterintrests]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadProfiles(page + 1, false);
  };

  const filteredUsers = searchText.trim()
    ? users.filter(
        u =>
          (u.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
          (u.profession || '').toLowerCase().includes(searchText.toLowerCase()),
      )
    : users;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/userdetail', params: { id: item.id } })}
    >
      <Image source={{ uri: item.avatar_url || PLACEHOLDER_AVATAR }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.cardGradient}
      >
        <Text style={styles.cardName} numberOfLines={1}>{item.full_name}</Text>
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
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setOpen(true)}>
          <Ionicons name="options-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.lightPink + '80'} />
        <TextInput
          placeholder="Search by name or profession…"
          placeholderTextColor={Colors.lightPink + '50'}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.lightPink + '60'} />
          </TouchableOpacity>
        )}
      </View>

      <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />

      {/* Results count */}
      {!loading && !error && filteredUsers.length > 0 && (
        <Text style={styles.countText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
          {searchText.trim() ? ` for "${searchText.trim()}"` : ''}
        </Text>
      )}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding people…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <View style={styles.stateIconCircle}>
            <Ionicons name="cloud-offline-outline" size={40} color={Colors.lightPink + '50'} />
          </View>
          <Text style={styles.stateTitle}>{error}</Text>
          <Text style={styles.stateSub}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfiles(1, true)} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : <View style={{ height: 30 }} />
          }
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <View style={styles.stateIconCircle}>
                <Ionicons name="search-outline" size={40} color={Colors.lightPink + '50'} />
              </View>
              <Text style={styles.stateTitle}>
                {searchText.trim() ? 'No results found' : 'No users in your area yet'}
              </Text>
              <Text style={styles.stateSub}>
                {searchText.trim()
                  ? 'Try a different name or adjust your filters.'
                  : 'Adjust your filters or check back later.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Searchuser;

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
    paddingBottom: 12,
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkPlum,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginHorizontal: 18,
    height: 46,
    gap: 10,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
  },

  /* Count */
  countText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
    paddingHorizontal: 18,
    paddingTop: 12,
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

  /* States */
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  stateIconCircle: {
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
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
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
});
