import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { height } = Dimensions.get('window');

interface UploadDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'image' | 'video' | 'file', uri: string) => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  visible,
  onClose,
  onSelect,
  setdocument,
  setimage,
  setvideo
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  // staggered animation for options
  const option1 = useRef(new Animated.Value(0)).current;
  const option2 = useRef(new Animated.Value(0)).current;
  const option3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // staggered pop-in for options
        Animated.stagger(100, [
          Animated.spring(option1, { toValue: 1, useNativeDriver: true }),
          Animated.spring(option2, { toValue: 1, useNativeDriver: true }),
          Animated.spring(option3, { toValue: 1, useNativeDriver: true }),
        ]).start();
      });
    } else {
      // reset options
      option1.setValue(0);
      option2.setValue(0);
      option3.setValue(0);

      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const pickMedia = async (type: 'image' | 'video') => {
    let result: any;
    if (type === 'image') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      
      setimage(result)
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
      setvideo(result)
    }

    if (!result.canceled) {
      onSelect(type, result.assets[0].uri);
      handleClose();
    }
  };

  // const pickFile = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  //     if (result.type === 'success') {
  //       onSelect('file', result.uri);
  //       handleClose();
  //     }
      
  //     setdocument(result)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.title}>Send</Text>
        <View style={styles.options}>
          {/* Image */}
          <Animated.View style={{ opacity: option1, transform: [{ scale: option1 }] }}>
            <TouchableOpacity style={styles.option} onPress={() => pickMedia('image')}>
              <Ionicons name="image" size={28} color="#4A90E2" />
              <Text style={styles.optionText}>Image</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Video */}
          <Animated.View style={{ opacity: option2, transform: [{ scale: option2 }] }}>
            <TouchableOpacity style={styles.option} onPress={() => pickMedia('video')}>
              <MaterialIcons name="video-library" size={28} color="#F5A623" />
              <Text style={styles.optionText}>Video</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* File */}
          {/* <Animated.View style={{ opacity: option3, transform: [{ scale: option3 }] }}>
            <TouchableOpacity style={styles.option} onPress={pickFile}>
              <MaterialIcons name="insert-drive-file" size={28} color="#50E3C2" />
              <Text style={styles.optionText}>File</Text>
            </TouchableOpacity>
          </Animated.View> */}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
