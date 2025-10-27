import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { useNavigation } from "@react-navigation/native";

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Request camera permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to scan nutrition labels"
      );
      return false;
    }
    return true;
  };

  // Take a photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true, // We'll need this for API upload in Phase 3
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      // In Phase 3, we'll upload the base64 image here
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      // In Phase 3, we'll upload the base64 image here
    }
  };

  // Analyze nutrition label
  const handleScan = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    setIsScanning(true);

    try {
      // Get stored token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please login first");
        setIsScanning(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      // Add image file
      const uriParts = selectedImage.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: selectedImage,
        name: `nutrition-label.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      console.log("📤 Uploading image to backend...");
      console.log("📍 URL:", `${API_BASE_URL}/scan/analyze`);
      console.log("🔑 Token:", token ? "Present" : "Missing");

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/scan/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      // Check if response is ok before parsing
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📥 Response data:", JSON.stringify(data, null, 2));

      setIsScanning(false);

      // Navigate to results screen
      (navigation as any).navigate("Results", {
        nutritionData: data.nutritionData,
        healthScore: data.healthScore,
      });

      // Clear image after successful scan
      setSelectedImage(null);
    } catch (error) {
      console.error("❌ Scan error:", error);
      setIsScanning(false);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to analyze nutrition label"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📷</Text>
          <Text style={styles.title}>Scan Nutrition Label</Text>
          <Text style={styles.subtitle}>
            Take a photo or select an image of a nutrition label
          </Text>
        </View>

        {/* Image Preview */}
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.scanButtonText}>🔍 Analyze Label</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🖼️</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={handleTakePhoto}
          >
            <Text style={styles.buttonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={handlePickImage}
          >
            <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Tips for Best Results:</Text>
          <Text style={styles.infoText}>• Ensure good lighting</Text>
          <Text style={styles.infoText}>• Keep the label flat and visible</Text>
          <Text style={styles.infoText}>• Avoid shadows and glare</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    height: 300,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  placeholderEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  cameraButton: {
    backgroundColor: "#4CAF50",
  },
  galleryButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },
});
