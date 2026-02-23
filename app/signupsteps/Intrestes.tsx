import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useDispatch, useSelector } from "react-redux";
import { profileintrests } from "@/store/profileSlice";
import { updateProfile } from "@/services/Profile";
import { uploadImageToSupabase } from "@/lib/supabsestorage";
import { uploadMultipleImages } from "@/lib/supabasemultiimages";

const { width, height: SCREEN_H } = Dimensions.get("window");

const interestsData = [
  { id: 1, name: "Music", icon: "music" },
  { id: 2, name: "Sports", icon: "football-ball" },
  { id: 3, name: "Travel", icon: "plane" },
  { id: 4, name: "Food", icon: "hamburger" },
  { id: 5, name: "Movies", icon: "film" },
  { id: 6, name: "Fitness", icon: "dumbbell" },
  { id: 7, name: "Books", icon: "book" },
  { id: 8, name: "Photography", icon: "camera" },
  { id: 9, name: "Gaming", icon: "gamepad" },
  { id: 10, name: "Art", icon: "paint-brush" },
  { id: 11, name: "Technology", icon: "laptop" },
  { id: 12, name: "Fashion", icon: "tshirt" },
];

const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

export default function SelectInterest() {
  const router = useRouter();
  const dispatch = useDispatch();

  const loginuserInfo = useSelector(
    (state: any) => state.profileSlice.userlogininfo
  );
  const profileData = useSelector(
    (state: any) => state.profileSlice.profiledata
  );
  const profileavtar = useSelector(
    (state: any) => state.profileSlice.profileavtar
  );
  const profilecetagory = useSelector(
    (state: any) => state.profileSlice.cetagory
  );
  const profileImgs = useSelector(
    (state: any) => state.profileSlice.profileImages
  );

  const [selected, setSelected] = useState<typeof interestsData>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (item: (typeof interestsData)[number]) => {
    const exists = selected.some((sel) => sel.id === item.id);
    if (exists) {
      setSelected(selected.filter((sel) => sel.id !== item.id));
    } else {
      setSelected([...selected, item]);
    }
  };

  useEffect(() => {
    dispatch(profileintrests(selected));
  }, [selected]);

  const isValid = selected.length >= 4;

  const submit = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const avtarpublicID = await uploadImageToSupabase(profileavtar);
      const avtarpublicIDS = await uploadMultipleImages(profileImgs);
      const interestNames = selected.map((i) => i.name);

      await updateProfile({
        full_name: profileData.full_name,
        nickname: profileData.nickname,
        gender: profileData.gender,
        avatar_url: avtarpublicID,
        email: profileData.email,
        phone: profileData.phone,
        images: avtarpublicIDS,
        interests: interestNames,
        date_of_birth: profileData?.date,
        about: profileData?.about,
        profession: profileData?.profession,
        cetagory: profilecetagory,
      });

      router.push("/(tabs)");
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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

        <Text style={styles.headerTitle}>Pick Your Interests</Text>
        <Text style={styles.headerSub}>
          Choose what you love so we can personalize your experience
        </Text>
      </LinearGradient>

      {/* Grid */}
      <FlatList
        data={interestsData}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = selected.some((s) => s.id === item.id);
          return (
            <TouchableOpacity
              style={[styles.card, active && styles.cardActive]}
              onPress={() => toggleInterest(item)}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name={item.icon}
                size={26}
                color={active ? Colors.white : Colors.softPink}
              />
              <Text style={[styles.cardText, active && styles.cardTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.countText}>
          {selected.length} selected
        </Text>

        <TouchableOpacity
          style={[styles.nextBtn, (!isValid || loading) && styles.nextBtnDisabled]}
          onPress={submit}
          disabled={!isValid || loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Text style={styles.nextText}>Finish</Text>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    textAlign: "center",
    paddingHorizontal: 12,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 100,
    borderRadius: 18,
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cardText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
  },
  cardTextActive: {
    color: Colors.white,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: Colors.wine + "40",
  },
  countText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.gray,
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
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
