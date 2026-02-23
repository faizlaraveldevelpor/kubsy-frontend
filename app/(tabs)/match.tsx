import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { getUserMatches } from '@/services/Matches';
import { useDispatch, useSelector } from 'react-redux';
import { allprofilesFnc } from '@/store/profileSlice';
import { fetchProfiles } from '@/services/Profile';

const { width } = Dimensions.get('window');
const NEW_CARD_WIDTH = width * 0.42;
const YOUR_CARD_WIDTH = width * 0.38;

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const FavoritesScreen = () => {
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip === true;
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const allprofileSlice = useSelector((state: any) => state?.profileSlice?.allprofiles);

  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [errorNewMatch, setErrorNewMatch] = useState<string | null>(null);
  const [errorYourMatch, setErrorYourMatch] = useState<string | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();

  const getFriendlyErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (/network|fetch|connection|timeout|internet/i.test(msg)) {
      return "Couldn't load. Check your connection and try again.";
    }
    return 'Something went wrong. Please try again.';
  };

  const fetchNewMatchProfiles = () => {
    if (!profileSlice?.id) return;
    setLoadingProfiles(true);
    setErrorNewMatch(null);
    fetchProfiles(profileSlice.id, {
      minAge: filterage?.length > 0 ? filterage[0] : 18,
      maxAge: filterage?.length > 0 ? filterage[1] : 40,
      maxDistance: 100,
      genderFilter: profileSlice.gender,
      professionFilter: [profileSlice.profession],
      userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests,
      userLat: profileSlice.latitude,
      userLon: profileSlice.longitude,
      cetagory: (profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
    })
      .then((res) => {
        const data = res?.data || [];
        const normalized = data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          distance_km: u.distance_km ? `${u.distance_km} km away` : 'N/A',
          avatar_url: u.avatar_url || 'https://placehold.co/400x400',
          dob: u.dob,
        }));
        dispatch(allprofilesFnc(normalized));
      })
      .catch((err) => {
        setErrorNewMatch(getFriendlyErrorMessage(err));
        dispatch(allprofilesFnc([]));
      })
      .finally(() => setLoadingProfiles(false));
  };

  const fetchYourMatches = async () => {
    if (!profileSlice?.id) return;
    setLoadingMatches(true);
    setErrorYourMatch(null);
    try {
      const yourMatch = await getUserMatches(profileSlice.id);
      const formattedMatches = (yourMatch || []).slice(0, 3).map((m: any) => ({
        ...m,
        age: m.dob ? calculateAge(m.dob) : 'N/A',
      }));
      setMatches(formattedMatches);
    } catch (error) {
      setErrorYourMatch(getFriendlyErrorMessage(error));
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchNewMatchProfiles();
  }, [profileSlice?.id, filterintrests, filterage]);

  useEffect(() => {
    fetchYourMatches();
  }, [profileSlice?.id]);

  const renderEmptyState = (icon: string, message: string, subtext?: string) => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon as any} size={36} color={Colors.lightPink + '50'} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
      {subtext ? <Text style={styles.emptySub}>{subtext}</Text> : null}
    </View>
  );

  const renderErrorState = (message: string, onRetry: () => void) => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="cloud-offline-outline" size={36} color={Colors.lightPink + '50'} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNewMatchCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.newCard}
      activeOpacity={0.85}
      onPress={() => router.push('userdetail')}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.newCardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.newCardGradient}
      >
        <Text style={styles.newCardName} numberOfLines={1}>{item.full_name}</Text>
        <View style={styles.newCardMeta}>
          <Ionicons name="briefcase-outline" size={11} color="rgba(255,255,255,0.7)" />
          <Text style={styles.newCardProfession} numberOfLines={1}>{item.profession}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderYourMatchCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.yourCard}
      activeOpacity={0.85}
      onPress={() => router.push('userdetail')}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.yourCardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={styles.yourCardGradient}
      >
        <Text style={styles.yourCardName} numberOfLines={1}>
          {item.full_name}{item.age !== 'N/A' ? `, ${item.age}` : ''}
        </Text>
      </LinearGradient>
      <View style={styles.yourCardHeart}>
        <Ionicons name="heart" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setOpen(true)}>
          <Ionicons name="options-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* New Match */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <FontAwesome5 name="fire" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>New Match</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('Allnewmatchusers')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingProfiles ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : errorNewMatch ? (
          renderErrorState(errorNewMatch, fetchNewMatchProfiles)
        ) : allprofileSlice && allprofileSlice.length > 0 ? (
          <FlatList
            data={allprofileSlice}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNewMatchCard}
            contentContainerStyle={styles.listPadding}
          />
        ) : (
          renderEmptyState(
            'people-outline',
            'No new profiles in your area yet',
            'Try adjusting your filters or check back later.'
          )
        )}

        {/* Your Match */}
        <View style={[styles.sectionRow, { marginTop: 28 }]}>
          <View style={styles.sectionLeft}>
            <Ionicons name="heart" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Your Match</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('Allyourmatch')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingMatches ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : errorYourMatch ? (
          renderErrorState(errorYourMatch, fetchYourMatches)
        ) : matches && matches.length > 0 ? (
          <FlatList
            data={matches}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderYourMatchCard}
            contentContainerStyle={styles.listPadding}
          />
        ) : (
          renderEmptyState(
            'heart-outline',
            "No matches yet",
            'Keep swiping — your matches will show up here!'
          )
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Premium upsell */}
      {!isPremium && !loadingProfiles && !loadingMatches && (
        <LinearGradient
          colors={[Colors.background + '00', Colors.background + 'CC', Colors.background, Colors.background]}
          locations={[0, 0.25, 0.45, 1]}
          style={styles.upgradeOverlay}
        >
          <View style={styles.upgradeCrownCircle}>
            <FontAwesome5 name="crown" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.upgradeTitle}>Get more matches</Text>
          <Text style={styles.upgradeSub}>
            Unlock unlimited swipes and see who likes you.
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 26,
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

  /* Sections */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 14,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  listPadding: {
    paddingLeft: 18,
    paddingRight: 6,
  },

  /* New Match Cards */
  newCard: {
    width: NEW_CARD_WIDTH,
    height: NEW_CARD_WIDTH * 1.4,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  newCardImage: {
    width: '100%',
    height: '100%',
  },
  newCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  newCardName: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  newCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  newCardProfession: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },

  /* Your Match Cards */
  yourCard: {
    width: YOUR_CARD_WIDTH,
    height: YOUR_CARD_WIDTH * 1.25,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  yourCardImage: {
    width: '100%',
    height: '100%',
  },
  yourCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  yourCardName: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  yourCardHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Loader */
  loaderWrap: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Empty state */
  emptyCard: {
    marginHorizontal: 18,
    backgroundColor: Colors.darkPlum,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.white,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    textAlign: 'center',
    marginTop: 6,
  },

  /* Error / Retry */
  retryBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  upgradeSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '80',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  upgradeBtn: {
    borderRadius: 24,
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
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 24,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
});

export default FavoritesScreen;
