import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, StatusBar, Alert 
} from "react-native";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Fonts } from "@/theme/fonts";
import { Colors } from "@/theme/color";
import { signUpEmail } from "@/services/Auth";
import { useDispatch } from "react-redux";
import { userlogininfo } from "@/store/profileSlice";

const Signup = () => {
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState(false); // ✅ button enable/disable

  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ Input validation
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email) && password.length >= 6) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => {
    validateInputs();
  }, [email, password]);

  const SignupHandler = async () => {
    if (!isValid) {
      Alert.alert("Error", "Please enter valid email and password (min 6 characters).");
      return;
    }
    try {
      const { data, error } = await signUpEmail(email, password);
      if (error) {
        Alert.alert("Signup Failed", error.message);
      } else {
        dispatch(userlogininfo({ email, password }));
        router.push("/signupsteps/Fillyourprofile");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      {/* Heading */}
      <Text style={styles.title}>Create Your Account</Text>

      {/* Email */}
      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={22} color={Colors.black} />
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View style={styles.inputBox}>
        <Feather name="lock" size={22} color={Colors.black} />
        <TextInput
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPass}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Feather name={showPass ? "eye" : "eye-off"} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Remember */}
      <TouchableOpacity style={styles.remember} onPress={() => setRemember(!remember)}>
        <Ionicons
          name={remember ? "checkbox" : "square-outline"}
          size={22}
          color={Colors.black}
        />
        <Text style={styles.rememberText}>Remember me</Text>
      </TouchableOpacity>

      {/* Button */}
      <TouchableOpacity
        style={[styles.btn, { opacity: isValid ? 1 : 0.5 }]}
        onPress={SignupHandler}
        disabled={!isValid}
      >
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Forgot */}
      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.lineWrap}>
        <View style={styles.line} />
        <Text style={styles.or}>or continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Social */}
      <View style={styles.socialRow}>
        <FontAwesome name="facebook-square" size={34} color={Colors.black} />
        <FontAwesome name="google" size={34} color={Colors.black} />
        <FontAwesome name="apple" size={34} color={Colors.black} />
      </View>

      {/* Signin */}
      <View style={styles.signupRow}>
        <Text style={styles.gray}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("Signinpassword")}>
          <Text style={styles.signup}> Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: Colors.background
  },

  backBtn: { marginTop: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },

  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    borderRadius:60
  },

  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    color: Colors.black,
    fontFamily:Fonts.bold
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
    borderColor: Colors.gray,
    gap: 8
  },

  input: {
    flex: 1,
    color: "#fff",
    fontFamily:Fonts.bold

  },

  remember: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },

  rememberText: {
    marginLeft: 8,
    fontSize: 15,
    color: Colors.black,
    fontFamily:Fonts.medium

  },

  btn: {
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: Colors.primary,

  },

  btnText: {
    
    fontSize: 16,
    fontFamily:Fonts.bold,
    color: Colors.white,
    
  },

  forgot: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: Colors.black,
    fontFamily:Fonts.regular
    
  },

  lineWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#444"
  },

  or: {
    marginHorizontal: 8,
    fontFamily:Fonts.regular,
    color: Colors.black,

  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  gray: {
    color: Colors.black,
    fontFamily:Fonts.regular

  },

  signup: {
    color: Colors.primary,
    fontFamily:Fonts.bold

  },
});
