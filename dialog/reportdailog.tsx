import { submitReport } from '@/services/Reported';
import React, { useState } from 'react';
import { Colors } from '@/theme/color';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';

export default function ReportDialog({ isVisible, onClose, reportedUserId, currentUserId }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    // Basic validation
    if (description.trim().length < 5) {
      Alert.alert("Error", "Please describe the reason in a bit more detail.");
      return;
    }

    setLoading(true);
    try {
      // API call: reporter_id, reported_id, description
      const result = await submitReport(currentUserId, reportedUserId, description);

      if (result.success) {
        Alert.alert("Thank you", "Your report has been submitted. An admin will review it shortly.");
        setDescription('');
        onClose();
      } else {
        Alert.alert("Error", result.error || "Report could not be submitted.");
      }
    } catch (error) {
      console.log("Report handle error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.dialogCard}>
            {/* Header */}
            <Text style={styles.title}>Report User</Text>
            <Text style={styles.subtitle}>Describe the reason so an admin can review it.</Text>

            {/* Input Field */}
            <TextInput
              style={styles.input}
              placeholder="Describe the issue (e.g. Bad behavior, Spamming)..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={Colors.gray}
              editable={!loading}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, styles.submitBtn]} 
                onPress={handleReport}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  dialogCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 25,
    padding: 24,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDarker,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.wine,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.lightgray,
    borderRadius: 15,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Colors.primaryDarker,
    borderWidth: 1,
    borderColor: Colors.gray,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.lightgray,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    color: Colors.wine,
    fontWeight: '700',
  },
  submitText: {
    color: Colors.white,
    fontWeight: '700',
  },
});