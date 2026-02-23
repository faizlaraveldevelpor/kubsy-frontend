import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const suggestedLanguages = ["English", "Spanish", "French"];
const allLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Hindi",
  "Portuguese",
  "Russian",
];

const Language = () => {
  const navigation = useNavigation();
  const safeTop = useSafeAreaTop();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Combined array to avoid duplicates in allLanguages
  const uniqueAllLanguages = allLanguages.filter(
    (lang) => !suggestedLanguages.includes(lang)
  );

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Language" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Suggested Section */}
        <Text style={styles.sectionTitle}>Suggested</Text>
        {suggestedLanguages.map((lang, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionRow}
            onPress={() => setSelectedLanguage(lang)}
          >
            <Text style={styles.optionText}>{lang}</Text>
            <View style={styles.radioOuter}>
              {selectedLanguage === lang && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* All Languages Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Language</Text>
        {uniqueAllLanguages.map((lang, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionRow}
            onPress={() => setSelectedLanguage(lang)}
          >
            <Text style={styles.optionText}>{lang}</Text>
            <View style={styles.radioOuter}>
              {selectedLanguage === lang && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Language;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.black,
    marginBottom: 10,
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
    fontFamily: Fonts.regular,
    color: Colors.black,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
