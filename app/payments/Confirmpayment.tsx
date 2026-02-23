import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons,FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

export default function ReviewSummaryScreen() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [modalVisible, setModalVisible] = useState(false);

  const amount = "$9.99";
  const tax = "$0.99";
  const total = "$10.98";

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Subscription Card */}
        <TouchableOpacity onPress={() => router.push("/payments/Payments")}>
          <View style={[styles.card, styles.cardBorder]}>
            <FontAwesome5 name="crown" size={100} color={Colors.primary}  />

            {/* <Image
            
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png" }}
              style={styles.vipImage}
            /> */}
            <Text style={styles.price}>$9.99 / Month</Text>
            <View style={styles.line} />
            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.point}>Unlimited Swipes</Text>
            </View>
            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.point}>Unlimited Likes</Text>
            </View>
            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.point}>No Ads</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Amount Details */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Amount</Text>
          <Text style={styles.summaryText}>{amount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Tax</Text>
          <Text style={styles.summaryText}>{tax}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { fontFamily: Fonts.bold }]}>Total</Text>
          <Text style={[styles.summaryText, { fontFamily: Fonts.bold }]}>{total}</Text>
        </View>

        {/* Card Info */}
        <View
          style={[
            styles.card,
            { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/196/196561.png" }}
              style={{ width: 40, height: 25, resizeMode: "contain", marginRight: 10 }}
            />
            <Text style={styles.cardNumber}>**** **** **** 4586</Text>
          </View>
          <TouchableOpacity onPress={()=>router.push("/payments/Payments")}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirm Payment Button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.confirmText}>Confirm Payment</Text>
      </TouchableOpacity>

      {/* Modal Dialog */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modelicon}>
            <FontAwesome5 name="crown" size={50} color={Colors.white}  />
            
            </View>
           
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>
              You have successfully subscribed to VIP for 1 month. Enjoy the benefits
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.black, marginLeft: 12 },

  card: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  cardBorder: { borderTopWidth: 3, borderTopColor: Colors.primary },
  vipImage: { width: 100, height: 100, resizeMode: "contain", marginBottom: 10 },
  price: { fontSize: 20, color: Colors.black, fontFamily: Fonts.bold,marginTop:10 },
  line: { width: "100%", height: 1, backgroundColor: "#ddd", marginVertical: 12 },
  pointRow: { width: "100%", flexDirection: "row", alignItems: "center", marginBottom: 6 },
  point: { marginLeft: 8, fontSize: 14, color: Colors.black, fontFamily: Fonts.regular },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginVertical: 5 },
  summaryText: { fontSize: 16, color: Colors.black, fontFamily: Fonts.medium },

  cardNumber: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.black },
  changeText: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.primary },

  confirmBtn: { backgroundColor: Colors.primary, paddingVertical: 16, alignItems: "center", margin: 20, borderRadius: 12 },
  confirmText: { color: "#fff", fontSize: 16, fontFamily: Fonts.bold },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalImage: { width: 100, height: 100, marginBottom: 15, resizeMode: "contain" },
  modalTitle: { fontSize: 20, fontFamily: Fonts.bold, marginBottom: 10, textAlign: "center",color:Colors.primary },
  modalText: { fontSize: 16, fontFamily: Fonts.medium, textAlign: "center", marginBottom: 20,color:Colors.black },
  modalBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
  modalBtnText: { color: "#fff", fontFamily: Fonts.bold, fontSize: 16 },
  modelicon:{
   backgroundColor:Colors.primary,
   width:120,
   height:120,
   borderRadius:60,
   flexDirection:"row",
   justifyContent:"center",
   alignItems:"center",
   marginBottom:40
  }
});
