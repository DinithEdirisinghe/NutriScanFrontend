import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { ProfileUpdatePayload } from "../types";

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();

  const [bloodSugar, setBloodSugar] = useState(
    user?.blood_sugar_mg_dl?.toString() || ""
  );
  const [ldlCholesterol, setLdlCholesterol] = useState(
    user?.ldl_cholesterol_mg_dl?.toString() || ""
  );
  const [weight, setWeight] = useState(user?.weight_kg?.toString() || "");
  const [height, setHeight] = useState(user?.height_cm?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const payload: ProfileUpdatePayload = {};

      if (bloodSugar) payload.blood_sugar_mg_dl = parseFloat(bloodSugar);
      if (ldlCholesterol)
        payload.ldl_cholesterol_mg_dl = parseFloat(ldlCholesterol);
      if (weight) payload.weight_kg = parseFloat(weight);
      if (height) payload.height_cm = parseFloat(height);

      await userAPI.updateProfile(payload);
      await refreshProfile(); // Refresh user data in context

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Health Metrics Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <Text style={styles.sectionSubtitle}>
            These values help us calculate personalized nutrition scores
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Sugar (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 95"
              placeholderTextColor="#999"
              value={bloodSugar}
              onChangeText={setBloodSugar}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal fasting: 70-100 mg/dL</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LDL Cholesterol (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 120"
              placeholderTextColor="#999"
              value={ldlCholesterol}
              onChangeText={setLdlCholesterol}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Optimal: Below 100 mg/dL</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 75.5"
              placeholderTextColor="#999"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 175"
              placeholderTextColor="#999"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});
