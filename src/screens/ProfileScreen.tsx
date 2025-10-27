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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [ldlCholesterol, setLdlCholesterol] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

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
      setBloodSugar(data.blood_sugar_mg_dl?.toString() || "");
      setLdlCholesterol(data.ldl_cholesterol_mg_dl?.toString() || "");
      setWeight(data.weight_kg?.toString() || "");
      setHeight(data.height_cm?.toString() || "");
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

      const payload: any = {};

      if (bloodSugar) payload.blood_sugar_mg_dl = parseFloat(bloodSugar);
      if (ldlCholesterol)
        payload.ldl_cholesterol_mg_dl = parseFloat(ldlCholesterol);
      if (weight) payload.weight_kg = parseFloat(weight);
      if (height) payload.height_cm = parseFloat(height);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.email}>{email}</Text>
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
            {bloodSugar && parseFloat(bloodSugar) > 0 && (
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      parseFloat(bloodSugar) >= 126
                        ? "#F44336"
                        : parseFloat(bloodSugar) >= 100
                        ? "#FF9800"
                        : "#4CAF50",
                  },
                ]}
              >
                {parseFloat(bloodSugar) >= 126
                  ? "⚠️ Diabetes range"
                  : parseFloat(bloodSugar) >= 100
                  ? "⚠️ Pre-diabetes range"
                  : "✓ Normal"}
              </Text>
            )}
            <Text style={styles.hint}>
              Normal: 70-99 • Pre-diabetes: 100-125 • Diabetes: ≥126
            </Text>
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
            {ldlCholesterol && parseFloat(ldlCholesterol) > 0 && (
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      parseFloat(ldlCholesterol) >= 160
                        ? "#F44336"
                        : parseFloat(ldlCholesterol) >= 130
                        ? "#FF9800"
                        : "#4CAF50",
                  },
                ]}
              >
                {parseFloat(ldlCholesterol) >= 190
                  ? "⚠️ Very high"
                  : parseFloat(ldlCholesterol) >= 160
                  ? "⚠️ High"
                  : parseFloat(ldlCholesterol) >= 130
                  ? "⚠️ Borderline high"
                  : parseFloat(ldlCholesterol) >= 100
                  ? "✓ Near optimal"
                  : "✓ Optimal"}
              </Text>
            )}
            <Text style={styles.hint}>
              Optimal: &lt;100 • Near optimal: 100-129 • High: ≥160
            </Text>
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

          {/* BMI Display */}
          {weight &&
            height &&
            parseFloat(weight) > 0 &&
            parseFloat(height) > 0 && (
              <View style={styles.bmiBox}>
                <Text style={styles.bmiLabel}>Body Mass Index (BMI)</Text>
                <Text style={styles.bmiValue}>
                  {(
                    parseFloat(weight) /
                    (parseFloat(height) / 100) ** 2
                  ).toFixed(1)}
                </Text>
                <Text
                  style={[
                    styles.bmiCategory,
                    {
                      color:
                        parseFloat(weight) / (parseFloat(height) / 100) ** 2 >=
                        30
                          ? "#F44336"
                          : parseFloat(weight) /
                              (parseFloat(height) / 100) ** 2 >=
                            25
                          ? "#FF9800"
                          : parseFloat(weight) /
                              (parseFloat(height) / 100) ** 2 >=
                            18.5
                          ? "#4CAF50"
                          : "#FF9800",
                    },
                  ]}
                >
                  {parseFloat(weight) / (parseFloat(height) / 100) ** 2 >= 30
                    ? "⚠️ Obese"
                    : parseFloat(weight) / (parseFloat(height) / 100) ** 2 >= 25
                    ? "⚠️ Overweight"
                    : parseFloat(weight) / (parseFloat(height) / 100) ** 2 >=
                      18.5
                    ? "✓ Normal"
                    : "Underweight"}
                </Text>
                <Text style={styles.hint}>
                  Normal: 18.5-24.9 • Overweight: 25-29.9 • Obese: ≥30
                </Text>
              </View>
            )}

          {/* Health Impact Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Personalized Scoring</Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>High blood sugar?</Text> Sugar scores
              weighted 40-50%
            </Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>High LDL cholesterol?</Text> Fat
              scores weighted 35-45%
            </Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>Overweight/Obese?</Text> Calorie
              scores weighted 30-40%
            </Text>
            <Text
              style={[styles.infoText, { marginTop: 8, fontStyle: "italic" }]}
            >
              Your scans will show stricter warnings for foods risky to YOUR
              health!
            </Text>
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
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  bmiBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  bmiLabel: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  bmiValue: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2E7D32",
    marginVertical: 8,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
