import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";

const DATA = [
  {
    title: "Types of Data We Collect",
    desc: "We collect basic information such as your name, email, phone number, and app usage details to improve the user experience.",
  },
  {
    title: "How We Use Your Data",
    desc: "Your data is used solely to provide app features, improve the service, and deliver better recommendations.",
  },
  {
    title: "Data Sharing Policy",
    desc: "We never sell or misuse your personal information. Data is only shared when required by law.",
  },
  {
    title: "Security of Your Data",
    desc: "We employ advanced security measures to keep your data safe and protected at all times.",
  },
  {
    title: "Your Rights",
    desc: "You can access, update, or delete your data at any time through the app settings.",
  },
  {
    title: "Cookies & Tracking",
    desc: "The app may use cookies and tracking tools to enhance your experience.",
  },
  {
    title: "Policy Updates",
    desc: "This policy may be updated from time to time. You will be notified of any changes within the app.",
  },
];

const Privacypolicy = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DATA.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Privacypolicy;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.darkPlum,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 2,
  },
  numberText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "80",
    lineHeight: 21,
  },
});
