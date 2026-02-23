import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const { width, height: SCREEN_H } = Dimensions.get("window");

const Createpin = () => {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", ""]);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (value: string, index: number) => {
    const newPin = [...pin];

    if (value === "") {
      newPin[index] = "";
      setPin(newPin);
      if (index > 0) inputRefs[index - 1].current?.focus();
      return;
    }

    if (/^\d$/.test(value)) {
      newPin[index] = value;
      setPin(newPin);
      if (index < 3) inputRefs[index + 1].current?.focus();
    }
  };

  const isValid = pin.join("").length === 4;

  const handleContinue = () => {
    const pinValue = pin.join("");
    console.log("PIN ->", pinValue);
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Ionicons name="lock-closed" size={36} color={Colors.softPink} style={{ marginBottom: 10 }} />
        <Text style={styles.headerTitle}>Create Your PIN</Text>
        <Text style={styles.headerSub}>
          Add a 4-digit PIN to keep your account secure
        </Text>
      </LinearGradient>

      {/* PIN inputs */}
      <View style={styles.body}>
        <View style={styles.pinRow}>
          {pin.map((p, index) => {
            const filled = p !== "";
            return (
              <View key={index} style={[styles.pinBox, filled && styles.pinBoxFilled]}>
                <TextInput
                  ref={inputRefs[index]}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry
                  value={p}
                  onChangeText={(value) => handleChange(value, index)}
                  selectionColor={Colors.primary}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>
          You'll use this PIN to secure sensitive actions
        </Text>
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
    </KeyboardAvoidingView>
  );
};

export default Createpin;

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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  pinRow: {
    flexDirection: "row",
    gap: 16,
  },
  pinBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.wine,
    backgroundColor: Colors.darkPlum,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBoxFilled: {
    borderColor: Colors.primary,
  },
  pinInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  hint: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginTop: 24,
    textAlign: "center",
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
