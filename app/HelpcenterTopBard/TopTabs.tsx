import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import HomeScreen from "./HomeScreen";
import ContectUs from "./ContectUs";

const Tab = createMaterialTopTabNavigator();

export default function TopTabs() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.lightPink + "60",
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: Fonts.bold,
            textTransform: "none",
          },
          tabBarIndicatorStyle: {
            backgroundColor: Colors.primary,
            height: 3,
            borderRadius: 2,
          },
          tabBarStyle: {
            backgroundColor: Colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.06)",
          },
        }}
      >
        <Tab.Screen name="FAQ" component={HomeScreen} />
        <Tab.Screen name="Contact Us" component={ContectUs} />
      </Tab.Navigator>
    </View>
  );
}

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
});
