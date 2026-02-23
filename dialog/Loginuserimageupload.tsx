import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const Loginuserimageupload = ({visible,setVisible}) => {
const [image, setImage] = useState(null);

const openCamera = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    alert("Camera permission required");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
    setVisible(false); // dialog close
  }
};
const openGallery = async () => {
  // const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  // if (!permission.granted) {
  //   alert("Gallery permission required");
  //   return;
  // }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
    setVisible(false); // dialog close
  }
};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      {/* Background */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setVisible(false)}
      />

      {/* Bottom Dialog */}
      <View style={styles.container}>
        <Text style={styles.title}>Upload Profile Picture</Text>

        {/* Camera Row */}
        <TouchableOpacity style={styles.row} onPress={()=>openCamera()}>
          <Feather name="camera" size={24} color="#000" />
          <Text style={styles.text}>Take Picture</Text>
        </TouchableOpacity>

        {/* Gallery Row */}
        <TouchableOpacity style={styles.row} onPress={()=>openGallery()}>
          <Ionicons name="image-outline" size={24} color="#000" />
          <Text style={styles.text}>Choose From Gallery</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default Loginuserimageupload;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  text: {
    fontSize: 16,
    marginLeft: 12,
  },
});
