import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const Changepin = () => {
  const navigation = useNavigation();
  const safeTop = useSafeAreaTop();
  const [pin, setPin] = useState(["", "", "", ""]);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (value: string, index: number) => {
    const newPin = [...pin];

    // If value empty -> go back
    if (value === "") {
      newPin[index] = "";
      setPin(newPin);

      if (index > 0) {
        inputRefs[index - 1].current?.focus();
      }
      return;
    }

    // only number allowed
    if (/^\d$/.test(value)) {
      newPin[index] = value;
      setPin(newPin);

      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleContinue = () => {
    const pinValue = pin.join("");
    console.log("PIN ->", pinValue);
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Create New Pin" onBack={() => navigation.goBack()} />

      {/* Subtitle */}
      <Text style={styles.subTitle}>
        Add a PIN number to make your account more secure
      </Text>

      {/* PIN Inputs */}
      <View style={styles.pinContainer}>
        {pin.map((p, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={styles.pinInput}
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry
            value={p}
            onChangeText={(value) => handleChange(value, index)}
          />
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[
            styles.button,
            pin.join("").length < 4 && { opacity: 0.5 },
          ]}
          disabled={pin.join("").length < 4}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Changepin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },

  subTitle: {
    marginTop: 25,
    fontSize: 15,
    color: Colors.black,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },

  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  pinInput: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    color: Colors.black,
    borderColor: "#bbb",
    fontFamily: Fonts.bold,
    marginHorizontal: 8,
  },

  bottomArea: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
  },

  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.bold,
  },
});
