import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";

const { height, width } = Dimensions.get("window");
const SLIDER_H = height * 0.52;

const Loginuserdetails = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [activeIndex, setActiveIndex] = useState(0);
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);

  const images = profileSlice?.images?.length > 0 ? profileSlice.images : [];

  return (
    <View style={styles.screen}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Image slider */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width, height: SLIDER_H }}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.length > 0 ? (
              images.map((img: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.sliderImg}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.sliderImg, styles.sliderEmpty]}>
                <Ionicons name="person" size={60} color={Colors.lightPink + "30"} />
              </View>
            )}
          </ScrollView>

          {/* Bottom gradient */}
          <LinearGradient
            colors={["transparent", Colors.background]}
            style={styles.sliderGradient}
            pointerEvents="none"
          />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: safeTop + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.info}>
          {/* Name + edit */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profileSlice?.full_name}</Text>
              {!!profileSlice?.profession && (
                <Text style={styles.profession}>{profileSlice.profession}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("Editloginuser")}
              activeOpacity={0.85}
            >
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* About */}
          {!!profileSlice?.about && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>{profileSlice.about}</Text>
            </View>
          )}

          {/* Interests */}
          {profileSlice?.interests?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipWrap}>
                {profileSlice.interests.map((interest: string, index: number) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Loginuserdetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Slider */
  sliderImg: {
    width,
    height: SLIDER_H,
  },
  sliderEmpty: {
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  /* Nav */
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dots: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },

  /* Info */
  info: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  profession: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    marginTop: 2,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Sections */
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "90",
    lineHeight: 23,
  },

  /* Chips */
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
  },
});
