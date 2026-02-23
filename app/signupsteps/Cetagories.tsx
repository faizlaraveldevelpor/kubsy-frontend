import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { cetagory } from "@/store/profileSlice";

const { width, height: SCREEN_H } = Dimensions.get("window");

const CATEGORIES = [
  { label: "Casual dating", icon: "coffee-outline", desc: "Keep it light & fun" },
  { label: "Hookups", icon: "fire", desc: "No strings attached" },
  { label: "Open to anything", icon: "heart-multiple-outline", desc: "Let's see what happens" },
  { label: "Friends first", icon: "account-group-outline", desc: "Build a connection first" },
];

const CategorySelection = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(CATEGORIES[0].label);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.darkPlum, Colors.wine]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>What are you looking for?</Text>
        <Text style={styles.headerSub}>
          Select what best describes your vibe
        </Text>
      </LinearGradient>

      {/* Options */}
      <View style={styles.body}>
        {CATEGORIES.map(({ label, icon, desc }) => {
          const active = selected === label;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelected(label)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <MaterialCommunityIcons
                  name={icon as any}
                  size={24}
                  color={active ? Colors.white : Colors.softPink}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                  {label}
                </Text>
                <Text style={[styles.cardDesc, active && styles.cardDescActive]}>
                  {desc}
                </Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            dispatch(cetagory(selected));
            router.push("/signupsteps/Photos");
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategorySelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    width,
    height: SCREEN_H * 0.25,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 28,
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: "center",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    marginTop: 6,
  },

  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "18",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.wine + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: Colors.primary,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  cardLabelActive: {
    color: Colors.white,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    marginTop: 2,
    opacity: 0.7,
  },
  cardDescActive: {
    opacity: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.wine,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: Colors.wine + "40",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 26,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
