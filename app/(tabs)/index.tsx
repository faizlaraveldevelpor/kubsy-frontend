import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import Hometop from '../../components/home/Hometop';
import Homebottom from '@/components/home/Homebottom';
import { Colors } from '@/theme/color';

import { fetchProfiles, getMyProfile } from '@/services/Profile';
import { allprofilesFnc, GetprofileApi, cetagory, setProfilesMetadata } from '@/store/profileSlice';
import { createaction } from '@/services/Like';
import { Fonts } from '@/theme/fonts';

function getAge(dob: string | number | null | undefined): number | 'N/A' {
  if (dob == null) return 'N/A';
  const date = typeof dob === 'number' ? new Date(dob) : new Date(dob);
  if (isNaN(date.getTime())) return 'N/A';
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age < 0 ? 'N/A' : age;
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const safeTop = useSafeAreaTop();

  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const categoryFromRedux = useSelector((state: any) => state?.profileSlice?.cetagory);
  const allprofileSlice = useSelector((state: any) => state?.profileSlice?.allprofiles || []);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterdistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const genderfilter = useSelector((state: any) => state?.profileSlice?.genderfilter);
  const [swipelimit, setswipelimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [actionState, setActionState] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const allprofileSliceRef = useRef(allprofileSlice);
  useEffect(() => {
    allprofileSliceRef.current = allprofileSlice;
  }, [allprofileSlice]);

  const getProfilesData = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    if (!profileSlice?.id) {
      setLoading(false);
      setIsFetchingNextPage(false);
      setError(null);
      return;
    }

    setError(null);
    if (pageNum === 1) setLoading(true);
    else setIsFetchingNextPage(true);

    try {
      const interests = (filterintrests?.length ? filterintrests : profileSlice.interests) || [];
      const res = await fetchProfiles(
        profileSlice.id,
        {
          minAge: filterage?.length > 0 ? filterage[0] : 18,
          maxAge: filterage?.length > 0 ? filterage[1] : 40,
          maxDistance: filterdistance?.length > 0 ? filterdistance[1] : 100,
          genderFilter: genderfilter && genderfilter.trim() !== '' ? genderfilter : undefined,
          professionFilter: [], // Home pe sab professions dikhane ke liye
          userInterests: Array.isArray(interests) ? interests : [],
          // Pehle Redux cetagory (Settings se update), phir userApi – taake kisi page se Home aane par bhi updated category jaye
          cetagory: (categoryFromRedux ?? profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
        },
        pageNum,
      );

      if (res?.message === 'Daily swipe limit reached.') {
        setswipelimit(res.message);
        dispatch(allprofilesFnc(isNewFilter ? [] : allprofileSliceRef.current));
        setHasMore(false);
        setPage(pageNum);
        setLoading(false);
        setIsFetchingNextPage(false);
        return;
      }

      if (res && Array.isArray(res.data)) {
        const newData = res.data.map((u: any) => {
          const dob = u.date_of_birth ?? u.dateOfBirth ?? null;
          const dobVal = (dob === '' || dob === undefined) ? null : dob;
          const age = typeof u.age === 'number' ? u.age : getAge(dobVal);
          return {
            id: u.id,
            full_name: u.full_name || 'Unknown',
            profession: u.profession || 'N/A',
            age,
            date_of_birth: dobVal,
            distance_km: u.distance_km ? `${u.distance_km} km away` : '0 km away',
            avatar_url: u.avatar_url || 'https://placehold.co/400x400',
          };
        });

        const updatedList = isNewFilter ? newData : [...allprofileSliceRef.current, ...newData];
        dispatch(allprofilesFnc(updatedList));
        if (res.metadata) dispatch(setProfilesMetadata(res.metadata));
        setHasMore(res.metadata?.has_more ?? false);
        setPage(pageNum);

        if (pageNum === 1 && isNewFilter) {
          try {
            const myProfileRes = await getMyProfile();
            if (myProfileRes?.data) {
              if (profileSlice?.is_vip === true && myProfileRes.data?.is_vip !== true) {
                const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
                if (cat != null && cat !== '') dispatch(cetagory(cat));
              } else {
                dispatch(GetprofileApi(myProfileRes.data));
                const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
                if (cat != null && cat !== '') dispatch(cetagory(cat));
              }
            }
          } catch (_) {}
        }
      } else {
        setError('default');
      }
    } catch (err: any) {
      console.log('API Error:', err);
      setError(err?.message || 'default');
      if (pageNum === 1) {
        dispatch(allprofilesFnc([]));
      }
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [profileSlice?.id, categoryFromRedux, filterage, filterintrests, genderfilter, filterdistance]);

  useEffect(() => {
    console.log(actionState);
    
    const sendInteraction = async () => {
      // Check karein ke actionState null na ho aur usme data ho
      if (actionState && actionState.currentUserId && actionState.type) {
        try {
          console.log(`Sending ${actionState.type} for user: ${actionState.currentUserId}`);
          const response = await createaction(actionState); 
          console.log("Action API Response Success:", response);
        } catch (err) {
          console.error("Action API Error:", err);
        }
      }
    };

    sendInteraction();
  }, [actionState]); // Jab bhi swipe action hoga, ye trigger hoga
  // categoryFromRedux + profileSlice (e.g. gender) – Settings/Personal Info update ke baad bhi refetch ho
  const filterKey = `${profileSlice?.id ?? ""}|${categoryFromRedux ?? ""}|${profileSlice?.gender ?? ""}|${(filterage ?? []).join("-")}|${(filterdistance ?? []).join("-")}|${genderfilter ?? ""}|${(filterintrests ?? []).join(",")}`;

  useEffect(() => {
    if (profileSlice?.id) {
      getProfilesData(1, true);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [profileSlice?.id, filterKey]);

  // Jab Home tab focus ho: pehle DB se profile + category Redux mein sync karo (lekin agar payment ke baad premium hai to stale fetch se overwrite na karo)
  useFocusEffect(
    useCallback(() => {
      if (!profileSlice?.id) return;
      let cancelled = false;
      (async () => {
        try {
          const myProfileRes = await getMyProfile();
          if (cancelled) return;
          if (myProfileRes?.data) {
            if (profileSlice?.is_vip === true && myProfileRes.data?.is_vip !== true) {
              const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
              if (cat != null && cat !== '') dispatch(cetagory(cat));
              return;
            }
            dispatch(GetprofileApi(myProfileRes.data));
            const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
            if (cat != null && cat !== '') dispatch(cetagory(cat));
          }
        } catch (_) {}
      })();
      return () => { cancelled = true; };
    }, [profileSlice?.id, profileSlice?.is_vip, dispatch])
  );

  const handleLoadMore = () => {
    if (isFetchingNextPage) return;
    const nextPage = page + 1;
    getProfilesData(nextPage, false);
  };

  // ✅ Yeh function swiped users ko Redux se remove karega
  const handleRemoveUserFromRedux = useCallback((userId: number) => {
    const filteredList = allprofileSlice.filter((user: any) => user.id !== userId);
    dispatch(allprofilesFnc(filteredList));
    
  }, [allprofileSlice]);

  

  const handleRetry = useCallback(() => {
    setError(null);
    getProfilesData(1, true);
  }, [getProfilesData]);

  const onRefresh = useCallback(async () => {
    if (!profileSlice?.id) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    try {
      await getProfilesData(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [profileSlice?.id, getProfilesData]);

  const waitingForProfile = !profileSlice?.id && !error;

  const canRefresh = !waitingForProfile;
  const refreshControl = canRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Colors.primary]}
      tintColor={Colors.primary}
    />
  ) : undefined;

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      <Hometop />

      {waitingForProfile ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateLoadingText}>Loading your profile…</Text>
        </View>
      ) : loading && page === 1 ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateLoadingText}>Finding matches…</Text>
        </View>
      ) : error ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.stateScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <View style={styles.stateCircle}>
            <Ionicons name="cloud-offline-outline" size={36} color={Colors.lightPink + '50'} />
          </View>
          <Text style={styles.stateTitle}>Couldn't load matches</Text>
          <Text style={styles.stateSub}>
            Check your connection and try again — we'll find someone great for you.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : swipelimit === 'Daily swipe limit reached.' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.stateScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <View style={styles.stateCircle}>
            <Ionicons name="flash" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.stateTitle}>Daily swipe limit reached</Text>
          <Text style={styles.stateSub}>
            You've used all your swipes for today. Come back tomorrow or upgrade for unlimited swipes!
          </Text>
          {!profileSlice?.is_vip && (
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
                <Text style={styles.upgradeBtnText}>Get Unlimited Swipes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.cardArea}>
          <Homebottom
            allusers={allprofileSlice}
            profileSlice={profileSlice}
            setActionState={setActionState}
            actionState={actionState}
            onLoadMore={handleLoadMore}
            isFetching={isFetchingNextPage}
            hasMore={hasMore}
            removeUser={handleRemoveUserFromRedux}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  cardArea: {
    flex: 1,
  },

  /* Shared state wrappers */
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  stateCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.darkPlum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  stateLoadingText: {
    marginTop: 14,
    color: Colors.lightPink + '70',
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  stateTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '70',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 22,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  /* Upgrade CTA */
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
    paddingHorizontal: 32,
    height: 52,
    borderRadius: 26,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});