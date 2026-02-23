import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const CONTACTS = [
  {
    label: "Email",
    value: "contact@kubsy.app",
    icon: "mail-outline" as const,
    color: Colors.primary,
    onPress: () => Linking.openURL("mailto:contact@kubsy.app"),
  },
  {
    label: "Website",
    value: "kubsy.app",
    icon: "globe-outline" as const,
    color: "#34C6F4",
    onPress: () => Linking.openURL("https://kubsy.app"),
  },
];

const ContectUs = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Get in touch with us through any of these channels
        </Text>

        {CONTACTS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} activeOpacity={0.85} onPress={item.onPress}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + "18" }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.lightPink + "40"} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ContectUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "60",
    marginBottom: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  cardValue: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "70",
    marginTop: 2,
  },
});
