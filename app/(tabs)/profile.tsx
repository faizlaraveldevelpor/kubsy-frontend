import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSelector } from 'react-redux';
import { logoutAndClearToken, getPushPermissionStatus, requestPushPermissionAndSave } from '@/hooks/usePushNotifications';

const { width } = Dimensions.get('window');

const ICON_COLOR = Colors.primary;
const ICON_BG = Colors.primary + '20';

const MENU_ITEMS = {
  account: [
    { label: 'Edit Profile', icon: 'person-outline', route: '/setting/Parsnalinformation' },
    { label: 'Discovery Preferences', icon: 'options-outline', route: '/setting/DiscoverySettings' },
  ],
  privacy: [
    { label: 'Blocked Users', icon: 'ban-outline', route: '/setting/BlockedUsers' },
    { label: 'Privacy Policy', icon: 'lock-closed-outline', route: '/setting/Privacypolicy' },
    { label: 'Help Center', icon: 'help-circle-outline', route: '/HelpcenterTopBard/TopTabs' },
  ],
};

export default function ProfileScreen() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip === true;
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'undetermined' | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const refreshNotificationStatus = async () => {
    const status = await getPushPermissionStatus();
    setNotificationStatus(status);
  };

  useEffect(() => {
    refreshNotificationStatus();
  }, []);

  const handleEnableNotifications = async () => {
    const userId = profileSlice?.id;
    if (!userId) return;
    setNotificationLoading(true);
    try {
      const result = await requestPushPermissionAndSave(userId);
      await refreshNotificationStatus();
      if (!result.granted) {
        Alert.alert(
          'Notifications',
          'Permission was denied or not available. You can enable it later in your device Settings → Apps → Kubsy → Notifications.'
        );
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleLogout = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      await logoutAndClearToken(data.user.id);
    }
    await supabase.auth.signOut();
    router.replace('/startScreen');
  };

  return (
    <View style={styles.screen}>
      {/* Fixed Profile Hero */}
      <LinearGradient
        colors={[Colors.primary, Colors.wine, Colors.darkPlum]}
        style={[styles.hero, { paddingTop: safeTop + 16 }]}
      >
        {/* Avatar */}
        <TouchableOpacity onPress={() => router.push('Loginuserdetails')} activeOpacity={0.85}>
          <View style={styles.avatarRing}>
            <Image
              source={{ uri: profileSlice?.avatar_url || 'https://www.gravatar.com/avatar/0?d=mp' }}
              style={styles.avatar}
            />
            {isPremium && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={24} color={Colors.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Name & details */}
        <Text style={styles.heroName}>
          {profileSlice?.full_name || profileSlice?.name || 'User'}
        </Text>
        {profileSlice?.nickname ? (
          <Text style={styles.heroNickname}>@{profileSlice.nickname}</Text>
        ) : null}

        {/* Quick info pills */}
        <View style={styles.pillsRow}>
          {profileSlice?.gender ? (
            <View style={styles.infoPill}>
              <Ionicons name={profileSlice.gender === 'Male' ? 'male' : profileSlice.gender === 'Female' ? 'female' : 'transgender'} size={14} color="#fff" />
              <Text style={styles.pillText}>{profileSlice.gender}</Text>
            </View>
          ) : null}
          {profileSlice?.cetagory ? (
            <View style={styles.infoPill}>
              <Ionicons name="heart" size={14} color="#fff" />
              <Text style={styles.pillText}>{profileSlice.cetagory}</Text>
            </View>
          ) : null}
          {isPremium && (
            <View style={[styles.infoPill, { backgroundColor: 'rgba(255,215,0,0.25)' }]}>
              <FontAwesome5 name="crown" size={12} color="#FFD700" />
              <Text style={[styles.pillText, { color: '#FFD700' }]}>VIP</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* VIP Card */}
        {!isPremium ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('Getvip')} style={styles.vipCardWrap}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.vipCard}
            >
              <View style={styles.vipLeft}>
                <View style={styles.vipCrownCircle}>
                  <FontAwesome5 name="crown" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vipTitle}>Upgrade to VIP</Text>
                  <Text style={styles.vipSub}>Unlimited swipes, likes & more</Text>
                </View>
              </View>
              <View style={styles.vipArrow}>
                <Entypo name="chevron-right" size={22} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.vipCardWrap}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.vipCard}
            >
              <View style={styles.vipLeft}>
                <View style={styles.vipCrownCircle}>
                  <FontAwesome5 name="crown" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vipTitle}>VIP Membership Active</Text>
                  <Text style={styles.vipSub}>Premium features unlocked</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/setting/Premiumamanagement')}>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuCard}>
            {/* Notifications – manual permission trigger */}
            <TouchableOpacity
              style={[styles.menuRow, styles.menuRowBorder]}
              onPress={notificationStatus === 'granted' ? undefined : handleEnableNotifications}
              activeOpacity={0.7}
              disabled={notificationStatus === 'granted' || notificationLoading}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: ICON_BG }]}>
                  <Ionicons name="notifications-outline" size={20} color={ICON_COLOR} />
                </View>
                <Text style={styles.menuText}>
                  {notificationStatus === 'granted' ? 'Notifications: On' : 'Enable notifications'}
                </Text>
              </View>
              {notificationLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : notificationStatus === 'granted' ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <Entypo name="chevron-right" size={20} color={Colors.lightPink + '80'} />
              )}
            </TouchableOpacity>
            {MENU_ITEMS.account.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < MENU_ITEMS.account.length - 1 && styles.menuRowBorder]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: ICON_BG }]}>  
                    <Ionicons name={item.icon as any} size={20} color={ICON_COLOR} />
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                </View>
                <Entypo name="chevron-right" size={20} color={Colors.lightPink + '80'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privacy & Support</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.privacy.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < MENU_ITEMS.privacy.length - 1 && styles.menuRowBorder]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: ICON_BG }]}>
                    <Ionicons name={item.icon as any} size={20} color={ICON_COLOR} />
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                </View>
                <Entypo name="chevron-right" size={20} color={Colors.lightPink + '80'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Kubsy v1.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 1,
  },
  heroName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  heroNickname: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#fff',
  },

  /* VIP Card */
  vipCardWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  vipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 18,
  },
  vipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vipCrownCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  vipSub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  vipArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#fff',
    textDecorationLine: 'underline',
  },

  /* Sections */
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.lightPink,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: Colors.darkPlum,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primary + '12',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },

  /* Footer */
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + '60',
    marginTop: 16,
  },
});
