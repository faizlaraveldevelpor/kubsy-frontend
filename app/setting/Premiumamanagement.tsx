import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { cancelSubscription } from "@/services/payments";
import { GetprofileApi } from "@/store/profileSlice";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

export default function SubscriptionManagement() {
  const router = useRouter();
  const dispatch = useDispatch();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const [loading, setLoading] = useState(false);
  
  const isPremium = profileSlice?.is_vip === true;
  const userId = profileSlice?.id;

  const handleCancelSubscription = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const data = await cancelSubscription(userId);
      dispatch(GetprofileApi(data.profile));
      Alert.alert("Success", "Your subscription has been cancelled. You will have free plan access now.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Benefits List
  const benefits = [
    { id: 1, text: "Unlimited Likes & Swipes", icon: "heart-circle" },
    { id: 2, text: "See Who Liked You", icon: "eye" },
    { id: 3, text: "5 Super Likes per day", icon: "star" },
    { id: 4, text: "Advanced Discovery Filters", icon: "options" },
    { id: 5, text: "Ad-free Experience", icon: "shield-checkmark" },
  ];

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Subscription Management" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* Status Card */}
        <View style={[styles.statusCard, isPremium ? styles.premiumBg : styles.freeBg]}>
          <View style={styles.statusHeader}>
            <Text style={styles.planTitle}>
              {isPremium ? "Premium VIP Member" : "Free Plan"}
            </Text>
            {isPremium && <FontAwesome5 name="crown" size={20} color={Colors.white} />}
          </View>
          
          <Text style={styles.statusSubText}>
            {isPremium 
              ? `Your plan will renew/expire on ${new Date(profileSlice?.membership_expires_at).toLocaleDateString()}` 
              : "Upgrade to unlock all premium features and find your match faster!"}
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Benefits</Text>
          {benefits.map((item) => (
            <View key={item.id} style={styles.benefitRow}>
              <Ionicons name={item.icon as any} size={22} color={isPremium ? Colors.primary : Colors.gray} />
              <Text style={[styles.benefitText, !isPremium && styles.benefitTextMuted]}>{item.text}</Text>
              {isPremium && <Ionicons name="checkmark-circle" size={20} color={Colors.green} />}
            </View>
          ))}
        </View>

        {/* Billing Information (Only for Premium) */}
       

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isPremium ? (
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push("Getvip")}>
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.cancelBtn, loading && styles.cancelBtnDisabled]} 
              onPress={() => Alert.alert("Cancel Subscription", "Are you sure? You will lose VIP benefits immediately.", [
                { text: "Keep Plan", style: "cancel" },
                { text: "Cancel Anyway", style: "destructive", onPress: handleCancelSubscription }
              ])}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ff4757" />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 18 },
  statusCard: { margin: 20, padding: 20, borderRadius: 20, elevation: 3 },
  premiumBg: { backgroundColor: Colors.primary, borderWidth: 1, borderColor: Colors.primary },
  freeBg: { backgroundColor: Colors.darkPlum, borderWidth: 1, borderColor: Colors.wine },
  
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.white },
  statusSubText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.white, lineHeight: 20, opacity: 0.9 },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.white, marginBottom: 15 },
  
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 15 },
  benefitText: { flex: 1, fontSize: 15, fontFamily: Fonts.medium, color: Colors.white },
  benefitTextMuted: { color: Colors.gray },

  billingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  billingTitle: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.white },
  billingValue: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.white, marginTop: 2, opacity: 0.8 },

  actionContainer: { paddingHorizontal: 20, marginTop: 10 },
  upgradeBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bold },
  cancelBtn: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ff4757' },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { color: '#ff4757', fontSize: 15, fontFamily: Fonts.bold },
});