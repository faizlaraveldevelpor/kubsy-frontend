import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch } from "react-redux";
import { profileavtar } from "@/store/profileSlice";

const Upoloadimage = ({ visible, setVisible }) => {
  const [image, setImage] = useState(null);
  const dispatch=useDispatch()
// pickImageFromGallery
const pickImageFromGallery = async () => {
    try {
      // const permission = await ImagePicker.requestCameraPermissionsAsync();
      // if (!permission.granted) {
      //   alert("Camera permission is required!");
      //   return;
      // }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setVisible(false);
      }
    } catch (error) {
      console.log("Camera Error:", error);
    }
  };

  // Camera se image click karna
  const takePhotoWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert("Camera permission is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setVisible(false);
      }
    } catch (error) {
      console.log("Camera Error:", error);
    }
  };
useEffect(()=>{
if (image) {
  console.log({image:image})
   dispatch(profileavtar({image:image}))
}
},[image])
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => setVisible(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={() => setVisible(false)}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Select Image</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.buttonText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={takePhotoWithCamera}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 15,
  },
});

export default Upoloadimage;
