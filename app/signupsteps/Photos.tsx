import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { profileImages } from "@/store/profileSlice";

const { width, height: SCREEN_H } = Dimensions.get("window");
const CARD_GAP = 14;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

export default function Photos() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [isValid, setIsValid] = useState(false);

  const pickImage = async (index: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  useEffect(() => {
    dispatch(profileImages(images));
    setIsValid(images.filter((img) => img !== null).length >= 2);
  }, [images]);

  const handleContinue = () => {
    if (!isValid) {
      Alert.alert("Upload Required", "Please upload at least 2 photos to continue.");
      return;
    }
    router.push("/signupsteps/Intrestes");
  };

  const uploadedCount = images.filter((i) => i !== null).length;

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

        <Feather name="image" size={36} color={Colors.softPink} style={{ marginBottom: 10 }} />
        <Text style={styles.headerTitle}>Add Your Best Photos</Text>
        <Text style={styles.headerSub}>
          Upload clear photos so people can recognize you
        </Text>
      </LinearGradient>

      {/* Photo grid */}
      <View style={styles.body}>
        <View style={styles.grid}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => pickImage(index)}
              activeOpacity={0.8}
            >
              {img ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: img }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <View style={styles.plusCircle}>
                    <AntDesign name="plus" size={22} color={Colors.white} />
                  </View>
                  <Text style={styles.addText}>Add photo</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.counter}>{uploadedCount} of 4 photos added</Text>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]}
          onPress={handleContinue}
          disabled={!isValid}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
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
  },

  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25,
    borderRadius: 20,
    overflow: "hidden",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    flex: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.wine,
    borderRadius: 20,
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
  },
  counter: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 20,
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
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
