import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Fonts } from "@/theme/fonts";
import { Colors } from "@/theme/color";
import { useDispatch, useSelector } from "react-redux";
import {
  agefilter,
  genderfilterfnc,
  distancefilterfnc,
} from "@/store/profileSlice";

const { width } = Dimensions.get("window");
const SLIDER_LEN = width - 76;

export default function DiscoverySettings() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const dispatch = useDispatch();

  const reduxAge = useSelector((state: any) => state?.profileSlice?.agefilter);
  const reduxGender = useSelector((state: any) => state?.profileSlice?.genderfilter);
  const reduxDistance = useSelector((state: any) => state?.profileSlice?.distancefilter);

  const [gender, setGender] = useState(reduxGender || "");
  const [ageRange, setAgeRange] = useState<number[]>(reduxAge || [18, 40]);
  const [distanceRange, setDistanceRange] = useState<number[]>(reduxDistance || [5, 50]);

  const handleApply = () => {
    dispatch(agefilter(ageRange));
    dispatch(genderfilterfnc(gender));
    dispatch(distancefilterfnc(distanceRange));
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discovery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Show Me</Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={g === "Male" ? "male" : g === "Female" ? "female" : "transgender"}
                  size={16}
                  color={gender === g ? "#fff" : Colors.lightPink + "70"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionLabel}>Age Range</Text>
            <View style={styles.rangeBadge}>
              <Text style={styles.rangeBadgeText}>
                {ageRange[0]} – {ageRange[1]}
              </Text>
            </View>
          </View>
          <View style={styles.sliderWrap}>
            <MultiSlider
              values={ageRange}
              min={18}
              max={60}
              step={1}
              onValuesChange={(v) => setAgeRange(v)}
              sliderLength={SLIDER_LEN}
              selectedStyle={styles.sliderTrack}
              unselectedStyle={styles.sliderTrackInactive}
              markerStyle={styles.sliderThumb}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>18</Text>
            <Text style={styles.sliderLabelText}>60</Text>
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sectionLabel}>Distance</Text>
            <View style={styles.rangeBadge}>
              <Text style={styles.rangeBadgeText}>
                {distanceRange[0]} – {distanceRange[1]} km
              </Text>
            </View>
          </View>
          <View style={styles.sliderWrap}>
            <MultiSlider
              values={distanceRange}
              min={1}
              max={200}
              step={1}
              onValuesChange={(v) => setDistanceRange(v)}
              sliderLength={SLIDER_LEN}
              selectedStyle={styles.sliderTrack}
              unselectedStyle={styles.sliderTrackInactive}
              markerStyle={styles.sliderThumb}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1 km</Text>
            <Text style={styles.sliderLabelText}>200 km</Text>
          </View>
        </View>
      </ScrollView>

      {/* Apply */}
      <View style={styles.footerWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleApply}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyBtn}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  /* Sections */
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.darkPlum,
  },
  genderActive: {
    backgroundColor: Colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.lightPink + "70",
  },
  genderTextActive: {
    color: "#fff",
    fontFamily: Fonts.bold,
  },

  /* Sliders */
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rangeBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rangeBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  sliderWrap: {
    alignItems: "center",
    marginTop: 10,
    overflow: "visible",
  },
  sliderTrack: {
    backgroundColor: Colors.primary,
    height: 4,
    borderRadius: 2,
  },
  sliderTrackInactive: {
    backgroundColor: Colors.darkPlum,
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: Colors.primary,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 6,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "50",
  },

  /* Footer */
  footerWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  applyBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
