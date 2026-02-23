import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useStripe } from "@stripe/stripe-react-native";
import { useSelector, useDispatch } from "react-redux";
import { GetprofileApi } from "@/store/profileSlice";
import { getMyProfile, updateProfile } from "@/services/Profile";

export default function Payment() {
  const router = useRouter();
  const dispatch = useDispatch();
  const safeTop = useSafeAreaTop();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false); // Loading state

  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );

  const API_URL = "https://vps.kubsy.app/api/v1"; 

  const initializePaymentSheet = async () => {
    try {
      setLoading(true); // Loader start

      // 1. Fetch Client Secret
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 2000,
          userId: profileSlice?.id,
        }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          !response.ok
            ? `Server error (${response.status}). Backend reachable nahi ya /create-payment-intent route check karein.`
            : "Invalid response from server"
        );
      }

      if (!data.clientSecret) {
        throw new Error(data?.error || "Backend se clientSecret nahi mila. Stripe key check karein.");
      }

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'Dating App Premium',
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
            name: profileSlice?.full_name || profileSlice?.nickname || 'User',
        }
      });

      if (initError) {
        setLoading(false);
        Alert.alert('Error', initError.message);
        return;
      }

      // 3. UI ko settle hone dein phir sheet kholein
      setLoading(false); 
      setTimeout(async () => {
        await openPaymentSheet();
      }, 500);

    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err.message);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert(`Error ${error.code}`, error.message);
      }
    } else {
      try {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);

        // Supabase DB mein directly update karo - taake re-fetch pe bhi VIP rahe
        await updateProfile({
          is_vip: true,
          profession: profileSlice?.profession || '',
          about: profileSlice?.about || '',
          cetagory: profileSlice?.cetagory || '',
        });

        // Redux bhi update karo
        dispatch(GetprofileApi({
          ...profileSlice,
          is_vip: true,
          member_ship_type: "premium",
          membership_expires_at: expiry.toISOString(),
        }));
      } catch (e) {
        console.log('Profile update error:', e);
      }
      Alert.alert('Success', 'Payment Successful! Your VIP status is now active.');
      router.replace("/(tabs)/profile");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.subText}>
          Pay securely with Stripe. You can add your card when you confirm payment.
        </Text>

        <View style={styles.methodCard}>
          <View style={styles.left}>
            <Ionicons name="card" size={26} color={Colors.primary} />
            <Text style={styles.methodText}>Stripe (Card / Apple Pay / Google Pay)</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
        </View>
      </ScrollView>

      {/* 2. CONFIRM PAYMENT BUTTON WITH LOADER */}
      <TouchableOpacity 
        style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
        onPress={initializePaymentSheet}
        disabled={loading} // Loading ke waqt click disable
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.confirmText}>Confirm Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, justifyContent: "space-between", paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.black, marginBottom: 10 },
  subText: { fontSize: 14, textAlign: "center", marginBottom: 20, color: Colors.black, fontFamily: Fonts.regular },
  methodCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.background, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#ddd", marginBottom: 14 },
  left: { flexDirection: "row", alignItems: "center" },
  methodText: { marginLeft: 12, fontSize: 15, color: Colors.black, fontFamily: Fonts.medium },
  confirmBtn: { 
    marginTop: "auto", 
    backgroundColor: Colors.primary, 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: "center", 
    marginBottom: 20, 
    marginHorizontal: 20,
    height: 55, // Fixed height taaki loader aane par size na badle
    justifyContent: 'center'
  },
  confirmText: { color: "#fff", fontSize: 18, fontFamily: Fonts.bold }
});