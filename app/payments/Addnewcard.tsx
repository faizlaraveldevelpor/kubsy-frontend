import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

export default function AddCardScreen() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  // 1. Formatting: Card number mein har 4 digits baad space dena
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, ""); 
    const limited = cleaned.slice(0, 16); 
    const formatted = limited.match(/.{1,4}/g)?.join(" ") || limited;
    setCardNumber(formatted);
  };

  // 2. Security: CVV mein sirf numbers allow karna
  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    setCvv(cleaned);
  };

  // 3. Logic: Card "Add" karne ka secure process
  const validateAndAdd = () => {
    const rawNumber = cardNumber.replace(/\s/g, "");
    
    // Basic Validations
    if (rawNumber.length < 16) {
      Alert.alert("Invalid Card", "Please enter a complete 16-digit card number.");
      return;
    }
    if (!expiry) {
      Alert.alert("Missing Expiry", "Please select the card expiry date.");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Invalid CVV", "CVV must be 3 or 4 digits.");
      return;
    }

    /* Note: Yahan se aap details kisi Payment Gateway (Stripe/Paypal) 
       ko bhej kar 'Token' mangwa saktay hain. 
       Hum pura card number apne database mein save nahi karengay.
    */
    
    Alert.alert(
      "Card Verified", 
      "Card details processed securely. No sensitive data saved locally.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
      </View>

      {/* Card Preview */}
      <View style={styles.cardBox}>
        <Text style={styles.cardText}>
          {cardNumber ? cardNumber : "**** **** **** 4586"}
        </Text>
        <Text style={styles.cardHolder}>{cardHolder.toUpperCase() || "USER NAME"}</Text>
        <Text style={styles.cardExpiry}>
          {expiry
            ? `${String(expiry.getMonth() + 1).padStart(2, "0")}/${expiry.getFullYear().toString().slice(-2)}`
            : "MM/YY"}
        </Text>
      </View>

      <View style={styles.line} />

      {/* Card Holder Name */}
      <Text style={styles.label}>Card Holder Name</Text>
      <TextInput
        placeholder="Enter Card Holder Name"
        style={styles.input}
        placeholderTextColor="#777"
        autoCapitalize="words"
        value={cardHolder}
        onChangeText={setCardHolder}
      />

      {/* Card Number */}
      <Text style={styles.label}>Card Number</Text>
      <TextInput
        placeholder="xxxx xxxx xxxx xxxx"
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#777"
        maxLength={19} 
        value={cardNumber}
        onChangeText={handleCardNumberChange}
      />

      <View style={styles.row}>
        {/* Expiry Date */}
        <View style={styles.col}>
          <Text style={styles.label}>Expiry Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: expiry ? Colors.black : "#777", fontFamily: Fonts.medium }}>
              {expiry
                ? `${String(expiry.getMonth() + 1).padStart(2, "0")}/${expiry.getFullYear().toString().slice(-2)}`
                : "MM / YY"}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={expiry || new Date()}
              mode="date"
              minimumDate={new Date()} // Past dates not allowed
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowPicker(Platform.OS === "ios");
                if (selectedDate) setExpiry(selectedDate);
              }}
            />
          )}
        </View>

        {/* CVV */}
        <View style={styles.col}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            placeholder="123"
            keyboardType="numeric"
            style={styles.input}
            secureTextEntry
            maxLength={4}
            placeholderTextColor="#777"
            value={cvv}
            onChangeText={handleCvvChange}
          />
        </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={validateAndAdd}
      >
        <Text style={styles.btnText}>Add Card</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, color: Colors.black, fontFamily: Fonts.bold },
  cardBox: { backgroundColor: Colors.primary, padding: 25, borderRadius: 20, marginTop: 10 },
  cardText: { color: "#fff", fontSize: 22, letterSpacing: 2, fontFamily: Fonts.bold },
  cardHolder: { color: "#fff", marginTop: 15, fontSize: 16, fontFamily: Fonts.bold },
  cardExpiry: { color: "#fff", marginTop: 5, fontSize: 14, fontFamily: Fonts.medium },
  line: { height: 1, backgroundColor: "#ccc", marginVertical: 25 },
  label: { fontSize: 16, marginBottom: 8, color: Colors.black, fontFamily: Fonts.medium },
  input: {
    borderWidth: 1,
    borderColor: Colors.black,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    color: Colors.black,
    fontFamily: Fonts.medium
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  col: { flex: 1 },
  bottomBtn: { marginTop: "auto", backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 18, fontFamily: Fonts.bold }
});