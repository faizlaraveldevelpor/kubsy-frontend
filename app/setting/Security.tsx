import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";

const Security = () => {
  const navigation = useNavigation();
  const safeTop = useSafeAreaTop();
  const [rememberMe, setRememberMe] = useState(false);
  const [faceID, setFaceID] = useState(false);
  const [biometricID, setBiometricID] = useState(false);
  const router=useRouter()

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Security" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Remember Me */}
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Remember Me</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#ccc", true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Face ID */}
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Face ID</Text>
          <Switch
            value={faceID}
            onValueChange={setFaceID}
            trackColor={{ false: "#ccc", true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Biometric ID */}
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Biometric ID</Text>
          <Switch
            value={biometricID}
            onValueChange={setBiometricID}
            trackColor={{ false: "#ccc", true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Google Authenticator */}
        <TouchableOpacity style={styles.optionRow} onPress={() => {}}>
          <Text style={styles.optionText}>Google Authenticator</Text>
          <Ionicons name="chevron-forward" size={22} color={Colors.black} />
        </TouchableOpacity>

        {/* Buttons */}
        <TouchableOpacity style={styles.button} onPress={()=>router.push("/setting/Changepin")}>
          <Text style={styles.buttonText}>Change PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={()=>router.push("/setting/Changepassword")}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Security;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },

  optionText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },

  button: {
    marginTop: 25,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.bold,
  },
});
