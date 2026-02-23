import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import Upoloadimage from "@/dialog/Upoloadimage";
import { useDispatch, useSelector } from "react-redux";
import { profiledata } from "@/store/profileSlice";

const { width, height: SCREEN_H } = Dimensions.get("window");
const TOTAL_STEPS = 3;

const GENDERS = [
  { label: "Male", icon: "gender-male" as const },
  { label: "Female", icon: "gender-female" as const },
  { label: "Other", icon: "gender-non-binary" as const },
];

const STEP_META = [
  { title: "Who are you?", sub: "Let's start with the basics" },
  { title: "Tell us more", sub: "What makes you, you?" },
  { title: "Almost done", sub: "Just a few more details" },
];

export default function Fillyourprofile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const loginuserInfo = useSelector(
    (state: any) => state.profileSlice.userlogininfo
  );
  const profileavtarFromRedux = useSelector(
    (state: any) => state.profileSlice.profileavtar
  );

  const [step, setStep] = useState(0);
  const [full_name, setFullName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const displayAvatar = avatar || profileavtarFromRedux;
  const [about, setAbout] = useState("");
  const [profession, setProfession] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [visible, setVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    const direction = nextStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30 * direction,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30 * direction);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const stepValid = (): boolean => {
    if (step === 0) return (full_name ?? "").trim().length > 0;
    if (step === 1)
      return (about ?? "").trim().length > 0 && (profession ?? "").trim().length > 0;
    if (step === 2) return (gender ?? "") !== "" && !!date;
    return false;
  };

  useEffect(() => {
    dispatch(
      profiledata({
        full_name: (full_name ?? "").trim(),
        nickname: "",
        email: "",
        phone: loginuserInfo?.number ?? "",
        selectedCountry: null,
        date: date ? date.toISOString() : new Date().toISOString(),
        gender: gender ?? "",
        avatar: displayAvatar || null,
        about: (about ?? "").trim(),
        profession: (profession ?? "").trim(),
      })
    );
  }, [full_name, date, gender, avatar, profileavtarFromRedux, about, profession]);

  const handleNext = () => {
    if (!stepValid()) {
      Alert.alert("Incomplete", "Please fill all fields to continue.");
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      animateTransition(step + 1);
    } else {
      router.push("/signupsteps/Cetagories");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.darkPlum, Colors.wine]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{STEP_META[step].title}</Text>
        <Text style={styles.headerSub}>{STEP_META[step].sub}</Text>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Step content */}
      <Animated.View
        style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarRing}>
                <Image
                  source={{
                    uri:
                      displayAvatar ??
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.avatar}
                />
              </View>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => setVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to add photo</Text>
            </View>

            <Upoloadimage visible={visible} setVisible={setVisible} />

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.softPink}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="What's your name?"
                  placeholderTextColor={Colors.gray + "80"}
                  value={full_name}
                  onChangeText={setFullName}
                  autoFocus
                />
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            {/* About */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>About</Text>
              <View style={[styles.inputWrap, styles.textAreaWrap]}>
                <Feather
                  name="edit-3"
                  size={20}
                  color={Colors.softPink}
                  style={[styles.inputIcon, { marginTop: 14 }]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell people about yourself..."
                  placeholderTextColor={Colors.gray + "80"}
                  value={about}
                  onChangeText={setAbout}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                />
              </View>
            </View>

            {/* Profession */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profession</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={Colors.softPink}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="What do you do?"
                  placeholderTextColor={Colors.gray + "80"}
                  value={profession}
                  onChangeText={setProfession}
                />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            {/* DOB */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.inputWrap}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={Colors.softPink}
                  style={styles.inputIcon}
                />
                <Text style={styles.dobText}>{date.toDateString()}</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === "ios" ? (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Date of Birth</Text>
                    <DateTimePicker
                      value={new Date(date)}
                      mode="date"
                      maximumDate={new Date()}
                      display="spinner"
                      textColor={Colors.white}
                      themeVariant="dark"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setDate(selectedDate);
                      }}
                      style={{ height: 180 }}
                    />
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalCancelBtn}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalConfirmBtn}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.modalConfirmText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={new Date(date)}
                  mode="date"
                  maximumDate={new Date()}
                  display="calendar"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )
            )}

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {GENDERS.map(({ label, icon }) => {
                  const selected = gender === label;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.genderChip,
                        selected && styles.genderChipActive,
                      ]}
                      onPress={() => setGender(label)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={icon}
                        size={22}
                        color={selected ? Colors.white : Colors.softPink}
                      />
                      <Text
                        style={[
                          styles.genderLabel,
                          selected && styles.genderLabelActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.stepIndicator}>
          {step + 1} of {TOTAL_STEPS}
        </Text>

        <TouchableOpacity
          style={[styles.nextBtn, !stepValid() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!stepValid()}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>
            {step === TOTAL_STEPS - 1 ? "Continue" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
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
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 4,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    marginTop: 6,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  progressDot: {
    width: (width - 80) / TOTAL_STEPS,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.darkPlum,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  stepContent: {},

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 28,
    right: width / 2 - 72,
    backgroundColor: Colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  avatarHint: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginTop: 10,
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.softPink,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
    paddingVertical: 14,
  },
  textAreaWrap: {
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  dobText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.white,
    paddingVertical: 14,
  },

  // Gender
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 16,
    backgroundColor: Colors.darkPlum,
  },
  genderChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
  },
  genderLabelActive: {
    color: Colors.white,
  },

  // Bottom bar
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
  stepIndicator: {
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

  // Date picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width - 48,
    backgroundColor: Colors.darkPlum,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.wine,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
