import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

export default function Changepassword() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Create New Password" onBack={() => router.back()} />

      {/* Image */}
      <Image
        source={require("../../assets/images/password.jpeg")}
        style={styles.image}
      />

      {/* Heading Text */}
      <Text style={styles.title}>Create your new password</Text>

      {/* Password Input */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={22} color="#7a7a7a" />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry={!showPass}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={Colors.black}
        />

        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Ionicons
            name={showPass ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#7a7a7a"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={22} color="#7a7a7a" />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
          placeholderTextColor={Colors.black}
        />

        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons
            name={showConfirm ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#7a7a7a"
          />
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 18 },
  image: {
    width: 160,
    height: 160,
    alignSelf: "center",
    marginTop: 30,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "600",
    color: Colors.black,
    fontFamily:Fonts.bold
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 20,
    height: 52,
    color:Colors.black
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color:Colors.black,
    fontFamily:Fonts.regular
  },
  btn: {
    backgroundColor:Colors.primary,
    marginTop: 35,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    // fontWeight: "700",
    fontSize: 16,
    fontFamily:Fonts.bold
  },
});
