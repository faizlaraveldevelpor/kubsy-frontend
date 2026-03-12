import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useStripe } from "@stripe/stripe-react-native";
import { useSelector, useDispatch } from "react-redux";
import { GetprofileApi } from "@/store/profileSlice";
import { getMyProfile, updateProfile } from "@/services/Profile";
import { getPaymentConfigFromApi } from "@/lib/paymentConfig";
import { getSLERate } from "@/lib/openExchangeRates";
import * as WebBrowser from "expo-web-browser";

const API_URL = "https://vps.kubsy.app/api/v1";

type PaymentMethod = "stripe" | "monime";

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; amountCents?: string }>();
  const dispatch = useDispatch();
  const safeTop = useSafeAreaTop();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [monimeEnabled, setMonimeEnabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");

  const amountCents = Math.max(1, parseInt(params.amountCents ?? "1999", 10) || 1999);

  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );

  useEffect(() => {
    getPaymentConfigFromApi().then((c) => {
      setStripeConfigured(!!c.configured);
      setMonimeEnabled(!!c.monimeEnabled);
    });
  }, []); 

  const initializePaymentSheet = async () => {
    try {
      setLoading(true); // Loader start

      // 1. Fetch Client Secret
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountCents,
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

  const startMonimeCheckout = async () => {
    if (!profileSlice?.id) {
      Alert.alert("Error", "Please sign in first.");
      return;
    }
    const successRedirect = "kubsy://payment-success";
    try {
      setLoading(true);
      const sleRate = await getSLERate();
      if (!sleRate || sleRate <= 0) {
        setLoading(false);
        Alert.alert("Error", "Could not get exchange rate. Try again later.");
        return;
      }
      const amountUsd = amountCents / 100;
      const monimeAmount = Math.round(amountUsd * sleRate);
      const res = await fetch(`${API_URL}/create-monime-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: monimeAmount,
          userId: profileSlice.id,
          successUrl: successRedirect,
          cancelUrl: successRedirect,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message ?? (data?.error ? String(data.error) : null) ?? "Could not start Monime checkout";
        throw new Error(msg);
      }
      setLoading(false);
      // In-app browser: jab Monime success par kubsy://payment-success open karega tab band hoga aur yahan result aayega
      const result = await WebBrowser.openAuthSessionAsync(data.checkoutUrl, successRedirect);
      if (result.type === "success" && result.url) {
        const profile = await getMyProfile();
        if (profile?.data?.is_vip) {
          dispatch(GetprofileApi(profile.data));
          Alert.alert("Success", "Payment Successful! Your VIP status is now active.");
          router.replace("/(tabs)/profile");
        }
      } else {
        const profile = await getMyProfile();
        if (profile?.data?.is_vip) {
          dispatch(GetprofileApi(profile.data));
          Alert.alert("Success", "Payment Successful! Your VIP status is now active.");
          router.replace("/(tabs)/profile");
        }
      }
    } catch (err: any) {
      setLoading(false);
      const message =
        err?.message ?? (typeof err === "string" ? err : err?.error ?? "Monime checkout failed.");
      Alert.alert("Error", typeof message === "string" ? message : "Monime checkout failed.");
    }
  };

  const onConfirmPayment = () => {
    if (selectedMethod === "stripe") {
      if (!stripeConfigured) {
        Alert.alert("Stripe not configured", "Backend par Stripe key set karein (payment table ya .env).");
        return;
      }
      initializePaymentSheet();
    } else {
      if (!monimeEnabled) {
        Alert.alert("Monime not configured", "Backend par Monime set karein (payment table: monime_token, monime_space).");
        return;
      }
      startMonimeCheckout();
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
        <Text style={styles.sectionLabel}>Select payment gateway</Text>
        <Text style={styles.subText}>
          Pay securely in-app. Choose one option below.
        </Text>

        {/* Stripe – same pattern as Monime: card, enabled only when configured */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            !stripeConfigured && styles.methodCardDisabled,
            selectedMethod === "stripe" && styles.methodCardSelected,
          ]}
          onPress={() => setSelectedMethod("stripe")}
          activeOpacity={0.8}
        >
          <View style={styles.left}>
            <Ionicons
              name="card"
              size={26}
              color={stripeConfigured ? Colors.primary : "#999"}
            />
            <View>
              <Text style={[styles.methodText, !stripeConfigured && styles.methodTextDisabled]}>
                Stripe
              </Text>
              <Text style={[styles.methodSubtext, !stripeConfigured && styles.methodTextDisabled]}>
                {stripeConfigured
                  ? "Card payment – pay in app"
                  : "Card payment (configure on server)"}
              </Text>
            </View>
          </View>
          {selectedMethod === "stripe" && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>

        {/* Monime – same pattern as Stripe: card, enabled only when configured */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            !monimeEnabled && styles.methodCardDisabled,
            selectedMethod === "monime" && styles.methodCardSelected,
          ]}
          onPress={() => setSelectedMethod("monime")}
          activeOpacity={0.8}
        >
          <View style={styles.left}>
            <MaterialCommunityIcons
              name="bank"
              size={26}
              color={monimeEnabled ? Colors.primary : "#999"}
            />
            <View>
              <Text style={[styles.methodText, !monimeEnabled && styles.methodTextDisabled]}>
                Monime
              </Text>
              <Text style={[styles.methodSubtext, !monimeEnabled && styles.methodTextDisabled]}>
                {monimeEnabled
                  ? "Card / Bank / QR – pay in app"
                  : "Card / Bank / QR (configure on server)"}
              </Text>
            </View>
          </View>
          {selectedMethod === "monime" && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
        onPress={onConfirmPayment}
        disabled={loading}
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
  sectionLabel: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.black, marginBottom: 6 },
  subText: { fontSize: 14, textAlign: "center", marginBottom: 20, color: Colors.black, fontFamily: Fonts.regular },
  methodCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.background, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#ddd", marginBottom: 14 },
  methodCardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  methodCardDisabled: { opacity: 0.7, borderColor: "#eee" },
  left: { flexDirection: "row", alignItems: "center" },
  methodText: { marginLeft: 12, fontSize: 15, color: Colors.black, fontFamily: Fonts.medium },
  methodSubtext: { marginLeft: 12, marginTop: 2, fontSize: 12, color: "#666", fontFamily: Fonts.regular },
  methodTextDisabled: { color: "#999" },
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