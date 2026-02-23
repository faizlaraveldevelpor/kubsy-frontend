import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import Loginuserimageupload from "@/dialog/Loginuserimageupload";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import {
  deleteAvatar,
  deleteMultipleImages,
} from "@/lib/Deleteimagessupabase";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "@/lib/supabasemultiimages";
import { updateProfile } from "@/services/Profile";

const { width } = Dimensions.get("window");
const IMG_SIZE = (width - 32 - 30) / 4;

const Editloginuser = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [about, setAbout] = useState("");
  const [profession, setProfession] = useState("");

  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [apiImages, setApiImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [apiAvatar, setApiAvatar] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );

  useEffect(() => {
    if (!profileSlice) return;
    setName(profileSlice.full_name || "");
    setNickname(profileSlice.nickname || "");
    setAbout(profileSlice.about || "");
    setProfession(profileSlice.profession || "");
    setInterests(profileSlice.interests || []);
    if (profileSlice.images?.length) {
      setApiImages(profileSlice.images);
      setImages(profileSlice.images);
    }
    if (profileSlice.avatar_url) {
      setApiAvatar(profileSlice.avatar_url);
      setAvatar(profileSlice.avatar_url);
    }
  }, [profileSlice]);

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = result.assets[0].uri;
        return updated;
      });
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const addInterest = () => {
    const trimmed = (interestInput ?? "").trim();
    if (!trimmed) return;
    setInterests((prev) => [...prev, trimmed]);
    setInterestInput("");
  };
  const deleteInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index));
  };

  const onSave = async () => {
    if (isSaving) return;
    if (!(name ?? "").trim() || !(nickname ?? "").trim()) {
      Alert.alert("Required", "Please fill your name and nickname.");
      return;
    }
    setIsSaving(true);
    try {
      const oldImages = apiImages;
      const newPickedImages = images.filter((img) => img && !oldImages.includes(img));
      const deletedImages = oldImages.filter((img) => !images.includes(img));

      if (deletedImages.length) await deleteMultipleImages(deletedImages);
      let uploadedPublicUrls: string[] = [];
      if (newPickedImages.length)
        uploadedPublicUrls = await uploadMultipleImages(newPickedImages);

      const finalImages = [
        ...oldImages.filter((img) => !deletedImages.includes(img)),
        ...uploadedPublicUrls,
      ];

      let finalAvatar = apiAvatar;
      if (avatar && avatar !== apiAvatar) {
        if (apiAvatar) await deleteAvatar(apiAvatar);
        finalAvatar = await uploadSingleImage(avatar);
      }

      const payload = {
        full_name: name,
        nickname,
        about,
        profession,
        interests,
        images: finalImages,
        avatar_url: finalAvatar,
      };

      await updateProfile(payload);
      router.back();
    } catch (err) {
      console.log("Save Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { paddingTop: safeTop }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.85}>
            <Image
              source={{
                uri:
                  avatar ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
              }}
              style={styles.avatarImg}
            />
            <View style={styles.cameraBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Loginuserimageupload visible={visible} setVisible={setVisible} />

          {/* Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Personal Info</Text>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.lightPink + "60"} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={Colors.lightPink + "40"}
              />
            </View>

            <Text style={styles.fieldLabel}>Nickname</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="at-outline" size={18} color={Colors.lightPink + "60"} />
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Nickname"
                placeholderTextColor={Colors.lightPink + "40"}
              />
            </View>

            <Text style={styles.fieldLabel}>Profession</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="briefcase-outline" size={18} color={Colors.lightPink + "60"} />
              <TextInput
                style={styles.input}
                value={profession}
                onChangeText={setProfession}
                placeholder="What do you do?"
                placeholderTextColor={Colors.lightPink + "40"}
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>About You</Text>
            <TextInput
              style={styles.aboutInput}
              value={about}
              onChangeText={setAbout}
              placeholder="Tell something about yourself..."
              placeholderTextColor={Colors.lightPink + "40"}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <View style={styles.interestInputRow}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Ionicons name="heart-outline" size={18} color={Colors.lightPink + "60"} />
                <TextInput
                  style={styles.input}
                  value={interestInput}
                  onChangeText={setInterestInput}
                  placeholder="Add an interest"
                  placeholderTextColor={Colors.lightPink + "40"}
                  onSubmitEditing={addInterest}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity style={styles.addInterestBtn} onPress={addInterest} activeOpacity={0.85}>
                <AntDesign name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {interests?.length > 0 && (
              <View style={styles.chipWrap}>
                {interests.map((item, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                    <TouchableOpacity onPress={() => deleteInterest(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <AntDesign name="close" size={12} color={Colors.lightPink} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photos</Text>
            <View style={styles.photoGrid}>
              {images?.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoCard}
                  onPress={() => pickImage(index)}
                  activeOpacity={0.85}
                >
                  {img ? (
                    <Image
                      source={{ uri: img }}
                      style={styles.photoImg}
                    />
                  ) : (
                    <View style={styles.photoEmpty}>
                      <Ionicons name="add" size={26} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={styles.saveBtnWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Editloginuser;

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
    paddingBottom: 110,
  },

  /* Avatar */
  avatarWrap: {
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  avatarImg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: Colors.background,
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 14,
  },

  /* Fields */
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.lightPink + "70",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },

  /* About */
  aboutInput: {
    backgroundColor: Colors.darkPlum,
    borderRadius: 14,
    padding: 14,
    height: 110,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
    lineHeight: 22,
  },

  /* Interests */
  interestInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addInterestBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
  },

  /* Photos */
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoCard: {
    width: IMG_SIZE,
    height: IMG_SIZE * 1.25,
    borderRadius: 16,
    overflow: "hidden",
  },
  photoImg: {
    width: "100%",
    height: "100%",
  },
  photoEmpty: {
    flex: 1,
    backgroundColor: Colors.darkPlum,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.primary + "40",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Save */
  saveBtnWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
