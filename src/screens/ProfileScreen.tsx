import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");

  // Health conditions (toggles)
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHighCholesterol, setHasHighCholesterol] = useState(false);
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(false);

  // Body metrics
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("Unknown");
  const [isHealthy, setIsHealthy] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (weight && height) {
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      const bmiValue = weightKg / (heightM * heightM);
      setBmi(Number(bmiValue.toFixed(1)));

      // Determine BMI category
      if (bmiValue < 18.5) setBmiCategory("Underweight");
      else if (bmiValue < 25) setBmiCategory("Normal");
      else if (bmiValue < 30) setBmiCategory("Overweight");
      else setBmiCategory("Obese");

      // Check if healthy
      setIsHealthy(
        !hasDiabetes &&
          !hasHighCholesterol &&
          !hasHighBloodPressure &&
          bmiValue >= 18.5 &&
          bmiValue < 25
      );
    } else {
      setBmi(null);
      setBmiCategory("Unknown");
    }
  }, [weight, height, hasDiabetes, hasHighCholesterol, hasHighBloodPressure]);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setEmail(data.email || "");

      // Health conditions
      setHasDiabetes(data.hasDiabetes || false);
      setHasHighCholesterol(data.hasHighCholesterol || false);
      setHasHighBloodPressure(data.hasHighBloodPressure || false);

      // Body metrics
      setWeight(data.weight?.toString() || "");
      setHeight(data.height?.toString() || "");
      setBmi(data.bmi || null);
      setBmiCategory(data.bmiCategory || "Unknown");
      setIsHealthy(data.isHealthy || false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load profile");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }

      const payload: any = {
        hasDiabetes,
        hasHighCholesterol,
        hasHighBloodPressure,
      };

      if (weight) payload.weight = parseFloat(weight);
      if (height) payload.height = parseFloat(height);

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      Alert.alert("Success ✅", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const getBMIColor = () => {
    if (bmiCategory === "Normal") return "#4CAF50";
    if (bmiCategory === "Underweight") return "#FF9800";
    if (bmiCategory === "Overweight") return "#FF9800";
    if (bmiCategory === "Obese") return "#F44336";
    return "#999";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>Health Profile</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.subtitle}>
            Simple health tracking for personalized scores
          </Text>
        </View>

        {/* Health Status Banner */}
        {isHealthy && bmi && (
          <View style={styles.healthyBanner}>
            <Text style={styles.healthyEmoji}>✅</Text>
            <Text style={styles.healthyText}>You're Healthy!</Text>
            <Text style={styles.healthySubtext}>
              No health conditions • Normal BMI ({bmi})
            </Text>
          </View>
        )}

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Body Metrics</Text>

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

          {/* BMI Display */}
          {bmi && (
            <View
              style={[
                styles.bmiBox,
                {
                  backgroundColor: getBMIColor() + "20",
                  borderColor: getBMIColor(),
                },
              ]}
            >
              <Text style={styles.bmiLabel}>Your BMI</Text>
              <Text style={[styles.bmiValue, { color: getBMIColor() }]}>
                {bmi}
              </Text>
              <Text style={[styles.bmiCategory, { color: getBMIColor() }]}>
                {bmiCategory}
              </Text>
              <Text style={styles.bmiHint}>
                {bmiCategory === "Normal" && "Great! Keep it up 💪"}
                {bmiCategory === "Underweight" && "Consider gaining weight"}
                {bmiCategory === "Overweight" && "Consider losing weight"}
                {bmiCategory === "Obese" && "Weight loss recommended"}
              </Text>
            </View>
          )}
        </View>

        {/* Health Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Health Conditions</Text>
          <Text style={styles.sectionSubtitle}>
            Toggle ON if you have any of these conditions
          </Text>

          {/* Diabetes Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>🩸 Diabetes</Text>
              <Text style={styles.toggleDescription}>
                Scores prioritize low-sugar foods
              </Text>
            </View>
            <Switch
              value={hasDiabetes}
              onValueChange={setHasDiabetes}
              trackColor={{ false: "#ddd", true: "#81C784" }}
              thumbColor={hasDiabetes ? "#4CAF50" : "#f4f3f4"}
              disabled={isLoading}
            />
          </View>

          {/* High Cholesterol Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>❤️ High Cholesterol</Text>
              <Text style={styles.toggleDescription}>
                Scores prioritize low-fat foods
              </Text>
            </View>
            <Switch
              value={hasHighCholesterol}
              onValueChange={setHasHighCholesterol}
              trackColor={{ false: "#ddd", true: "#81C784" }}
              thumbColor={hasHighCholesterol ? "#4CAF50" : "#f4f3f4"}
              disabled={isLoading}
            />
          </View>

          {/* High Blood Pressure Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>💓 High Blood Pressure</Text>
              <Text style={styles.toggleDescription}>
                Scores prioritize low-sodium foods
              </Text>
            </View>
            <Switch
              value={hasHighBloodPressure}
              onValueChange={setHasHighBloodPressure}
              trackColor={{ false: "#ddd", true: "#81C784" }}
              thumbColor={hasHighBloodPressure ? "#4CAF50" : "#f4f3f4"}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How It Works</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Healthy:</Text> All nutrients weighted
            equally
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Diabetes:</Text> Sugar scores count more
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>High Cholesterol:</Text> Fat scores
            count more
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>High BP:</Text> Sodium scores count more
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Overweight/Obese:</Text> Calorie scores
            count more
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Underweight:</Text> High calories are
            encouraged
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Save Health Profile</Text>
          )}
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  healthyBanner: {
    backgroundColor: "#E8F5E9",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  healthyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  healthyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  healthySubtext: {
    fontSize: 14,
    color: "#2E7D32",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
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
  bmiBox: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  bmiValue: {
    fontSize: 42,
    fontWeight: "bold",
    marginVertical: 8,
  },
  bmiCategory: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  bmiHint: {
    fontSize: 13,
    color: "#666",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 15,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: "#666",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
