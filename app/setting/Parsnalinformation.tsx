import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { updateProfile, updateCategoryApi, getMyProfile } from "@/services/Profile";
import { useSelector, useDispatch } from "react-redux";
import { GetprofileApi, cetagory } from "@/store/profileSlice";

const CATEGORY_OPTIONS = [
  "Casual dating",
  "Hookups",
  "Open to anything",
  "Friends first",
];

const Parsnalinformation = () => {
  const safeTop = useSafeAreaTop();
  const dispatch = useDispatch();
  const router = useRouter();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);

  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(profileSlice?.full_name || "");
    setNickname(profileSlice?.nickname || "");
    setDob(profileSlice?.date_of_birth || "");
    setPhone(profileSlice?.phone || "");
    setGender(profileSlice?.gender || "");
    setCategory(profileSlice?.cetagory || "");
  }, [profileSlice]);

  const handleConfirmDate = (date: Date) => {
    setDob(date.toISOString().split("T")[0]);
    setDatePickerVisible(false);
  };

  const submit = async () => {
    if (!profileSlice?.id) return;
    setSaving(true);
    try {
      await updateProfile({
        full_name: firstName,
        nickname,
        date_of_birth: dob,
        phone,
        gender,
      });

      if ((category ?? "").trim()) {
        await updateCategoryApi(profileSlice.id, category.trim());
      }

      const myProfileRes = await getMyProfile();
      if (myProfileRes?.data) {
        dispatch(GetprofileApi(myProfileRes.data));
        const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
        if (cat != null && cat !== "") dispatch(cetagory(cat));
      }

      Alert.alert("Saved", "Your information has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={Colors.lightPink + "60"} />
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
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

          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => setDatePickerVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.lightPink + "60"} />
            <Text style={[styles.inputText, !dob && { color: Colors.lightPink + "40" }]}>
              {dob || "YYYY-MM-DD"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisible(false)}
          />

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={18} color={Colors.lightPink + "60"} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={Colors.lightPink + "40"}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={
                    g === "Male" ? "male" : g === "Female" ? "female" : "transgender"
                  }
                  size={16}
                  color={gender === g ? "#fff" : Colors.lightPink + "70"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === g && styles.genderTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Looking For</Text>
          <Text style={styles.sectionHint}>What kind of connection are you seeking?</Text>
          <View style={styles.categoryWrap}>
            {CATEGORY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.categoryBtn, category === opt && styles.categoryActive]}
                onPress={() => setCategory(opt)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === opt && styles.categoryTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.saveBtnWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={submit} disabled={saving}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Parsnalinformation;

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

  /* Sections */
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 14,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.lightPink + "60",
    marginTop: -8,
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
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 10,
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

  /* Category */
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Colors.darkPlum,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.lightPink + "70",
  },
  categoryTextActive: {
    color: "#fff",
    fontFamily: Fonts.bold,
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
