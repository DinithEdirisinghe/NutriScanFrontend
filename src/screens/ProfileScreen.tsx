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

  // Blood Sugar & Diabetes
  const [glucose, setGlucose] = useState("");
  const [hba1c, setHba1c] = useState("");

  // Cholesterol & Heart Health
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  // Blood Pressure
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  // Body Metrics
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bmi, setBmi] = useState("");
  const [age, setAge] = useState("");

  // Liver Function
  const [alt, setAlt] = useState("");
  const [ast, setAst] = useState("");
  const [ggt, setGgt] = useState("");

  // Kidney & Inflammation
  const [creatinine, setCreatinine] = useState("");
  const [crp, setCrp] = useState("");
  const [uricAcid, setUricAcid] = useState("");

  // Scoring preferences
  const [scoringMode, setScoringMode] = useState<"portion-aware" | "per-100g">(
    "portion-aware"
  );

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

      // Blood Sugar & Diabetes
      setGlucose(data.glucose?.toString() || "");
      setHba1c(data.hba1c?.toString() || "");

      // Cholesterol & Heart Health
      setLdl(data.ldl?.toString() || "");
      setHdl(data.hdl?.toString() || "");
      setTriglycerides(data.triglycerides?.toString() || "");

      // Blood Pressure
      setSystolic(data.systolic?.toString() || "");
      setDiastolic(data.diastolic?.toString() || "");

      // Body Metrics
      setWeight(data.weight?.toString() || "");
      setHeight(data.height?.toString() || "");
      setWaist(data.waist?.toString() || "");
      setBmi(data.bmi?.toString() || "");
      setAge(data.age?.toString() || "");

      // Liver Function
      setAlt(data.alt?.toString() || "");
      setAst(data.ast?.toString() || "");
      setGgt(data.ggt?.toString() || "");

      // Kidney & Inflammation
      setCreatinine(data.creatinine?.toString() || "");
      setCrp(data.crp?.toString() || "");
      setUricAcid(data.uric_acid?.toString() || "");

      // Scoring preferences
      setScoringMode(data.scoringMode || "portion-aware");
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

      // Blood Sugar & Diabetes
      if (glucose) payload.glucose = parseFloat(glucose);
      if (hba1c) payload.hba1c = parseFloat(hba1c);

      // Cholesterol & Heart Health
      if (ldl) payload.ldl = parseFloat(ldl);
      if (hdl) payload.hdl = parseFloat(hdl);
      if (triglycerides) payload.triglycerides = parseFloat(triglycerides);

      // Blood Pressure
      if (systolic) payload.systolic = parseInt(systolic);
      if (diastolic) payload.diastolic = parseInt(diastolic);

      // Body Metrics
      if (weight) payload.weight = parseFloat(weight);
      if (height) payload.height = parseFloat(height);
      if (waist) payload.waist = parseFloat(waist);
      if (bmi) payload.bmi = parseFloat(bmi);
      if (age) payload.age = parseInt(age);

      // Liver Function
      if (alt) payload.alt = parseFloat(alt);
      if (ast) payload.ast = parseFloat(ast);
      if (ggt) payload.ggt = parseFloat(ggt);

      // Kidney & Inflammation
      if (creatinine) payload.creatinine = parseFloat(creatinine);
      if (crp) payload.crp = parseFloat(crp);
      if (uricAcid) payload.uric_acid = parseFloat(uricAcid);

      // Scoring preferences
      payload.scoringMode = scoringMode;

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
          <Text style={styles.title}>Health Profile</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.subtitle}>
            Complete for personalized nutrition scoring
          </Text>
        </View>

        {/* Demographics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Basic Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 35"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={!isLoading}
            />
          </View>
        </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Waist Circumference (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 85"
              placeholderTextColor="#999"
              value={waist}
              onChangeText={setWaist}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Measure at belly button level</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BMI</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 24.5"
              placeholderTextColor="#999"
              value={bmi}
              onChangeText={setBmi}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Blood Sugar & Diabetes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩸 Blood Sugar & Diabetes</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fasting Glucose (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 95"
              placeholderTextColor="#999"
              value={glucose}
              onChangeText={setGlucose}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>
              Normal: 70-99 • Pre-diabetes: 100-125 • Diabetes: ≥126
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>HbA1c (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.5"
              placeholderTextColor="#999"
              value={hba1c}
              onChangeText={setHba1c}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>
              Normal: &lt;5.7 • Pre-diabetes: 5.7-6.4 • Diabetes: ≥6.5
            </Text>
          </View>
        </View>

        {/* Cholesterol & Heart Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ Cholesterol & Heart</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LDL Cholesterol (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 120"
              placeholderTextColor="#999"
              value={ldl}
              onChangeText={setLdl}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Optimal: &lt;100 • High: ≥160</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>HDL Cholesterol (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 55"
              placeholderTextColor="#999"
              value={hdl}
              onChangeText={setHdl}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Good: ≥60 • Low: &lt;40</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Triglycerides (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              placeholderTextColor="#999"
              value={triglycerides}
              onChangeText={setTriglycerides}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: &lt;150 • High: ≥200</Text>
          </View>
        </View>

        {/* Blood Pressure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💓 Blood Pressure</Text>

          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Systolic</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                placeholderTextColor="#999"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Diastolic</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                placeholderTextColor="#999"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>
          </View>
          <Text style={styles.hint}>Normal: &lt;120/80 • High: ≥140/90</Text>
        </View>

        {/* Liver Function */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🫀 Liver Function</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ALT (U/L)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 25"
              placeholderTextColor="#999"
              value={alt}
              onChangeText={setAlt}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: 7-56</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>AST (U/L)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              placeholderTextColor="#999"
              value={ast}
              onChangeText={setAst}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: 10-40</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GGT (U/L)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 20"
              placeholderTextColor="#999"
              value={ggt}
              onChangeText={setGgt}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: 0-51</Text>
          </View>
        </View>

        {/* Kidney & Inflammation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Kidney & Inflammation</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Creatinine (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1.0"
              placeholderTextColor="#999"
              value={creatinine}
              onChangeText={setCreatinine}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: 0.6-1.2</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CRP (mg/L)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2.0"
              placeholderTextColor="#999"
              value={crp}
              onChangeText={setCrp}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Low risk: &lt;1 • High: &gt;3</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Uric Acid (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.5"
              placeholderTextColor="#999"
              value={uricAcid}
              onChangeText={setUricAcid}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.hint}>Normal: 2.4-7.0</Text>
          </View>
        </View>

        {/* Scoring Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Scoring Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Choose how portion sizes affect health scores
          </Text>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                scoringMode === "portion-aware" && styles.toggleOptionActive,
              ]}
              onPress={() => setScoringMode("portion-aware")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  scoringMode === "portion-aware" && styles.toggleLabelActive,
                ]}
              >
                🍽️ Portion-Aware
              </Text>
              <Text
                style={[
                  styles.toggleDescription,
                  scoringMode === "portion-aware" &&
                    styles.toggleDescriptionActive,
                ]}
              >
                Penalizes small ultra-processed servings (Recommended)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                scoringMode === "per-100g" && styles.toggleOptionActive,
              ]}
              onPress={() => setScoringMode("per-100g")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  scoringMode === "per-100g" && styles.toggleLabelActive,
                ]}
              >
                📊 Per-100g Only
              </Text>
              <Text
                style={[
                  styles.toggleDescription,
                  scoringMode === "per-100g" && styles.toggleDescriptionActive,
                ]}
              >
                Same recipe = same score regardless of size
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 <Text style={styles.bold}>Portion-Aware:</Text> Small servings
              (e.g., 15g candy) get lower scores because they're often
              ultra-processed and encourage overconsumption.
            </Text>
            <Text style={styles.infoText}>
              💡 <Text style={styles.bold}>Per-100g:</Text> All portions of the
              same food get the same score. Better for comparing brands.
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Personalized Scoring</Text>
          <Text style={styles.infoText}>
            • More health data = more accurate scores
          </Text>
          <Text style={styles.infoText}>
            • Warnings specific to YOUR health risks
          </Text>
          <Text style={styles.infoText}>
            • AI recommendations tailored to your conditions
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
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  rowGroup: {
    flexDirection: "row",
    marginBottom: 5,
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
    fontSize: 11,
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
  toggleContainer: {
    gap: 12,
  },
  toggleOption: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  toggleOptionActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  toggleLabelActive: {
    color: "#2E7D32",
  },
  toggleDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  toggleDescriptionActive: {
    color: "#2E7D32",
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
