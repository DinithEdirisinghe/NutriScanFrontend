import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { useNavigation } from "@react-navigation/native";

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Changed to array for multi-image
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"label" | "food" | "enhanced">(
    "enhanced"
  ); // Added enhanced mode

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

    // Check if we're in enhanced mode and already have 3 images
    if (scanMode === "enhanced" && selectedImages.length >= 3) {
      Alert.alert("Maximum Images", "You can only add up to 3 images");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (scanMode === "enhanced") {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      } else {
        setSelectedImages([result.assets[0].uri]); // Single image for label/food mode
      }
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    // Check if we're in enhanced mode and already have 3 images
    if (scanMode === "enhanced" && selectedImages.length >= 3) {
      Alert.alert("Maximum Images", "You can only add up to 3 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (scanMode === "enhanced") {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      } else {
        setSelectedImages([result.assets[0].uri]); // Single image for label/food mode
      }
    }
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Analyze nutrition label
  const handleScan = async () => {
    if (!selectedImages || selectedImages.length === 0) {
      Alert.alert("No Image", "Please select at least one image");
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

      // Choose endpoint based on scan mode
      let endpoint = "/scan/analyze";

      if (scanMode === "enhanced") {
        endpoint = "/scan/enhanced";
        // Add all images for enhanced mode
        selectedImages.forEach((imageUri, index) => {
          const uriParts = imageUri.split(".");
          const fileType = uriParts[uriParts.length - 1];

          formData.append("images", {
            uri: imageUri,
            name: `food-image-${index + 1}.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        });
        console.log(
          `📤 Uploading ${selectedImages.length} image(s) to enhanced endpoint...`
        );
      } else {
        // Single image for label/food mode
        const imageUri = selectedImages[0];
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("image", {
          uri: imageUri,
          name: `nutrition-label.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        if (scanMode === "food") {
          endpoint = "/scan/food-photo";
        }
        console.log(`� Uploading image to ${scanMode} endpoint...`);
      }

      console.log("📍 URL:", `${API_BASE_URL}${endpoint}`);
      console.log("🔑 Token:", token ? "Present" : "Missing");

      // Send to backend
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log("📡 Response status:", response.status);

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
        aiAdvice: data.aiAdvice,
        // Enhanced/Food photo specific data
        scanType: data.scanType,
        foodName: data.foodName,
        confidence: data.confidence,
        disclaimer: data.disclaimer,
        foodContext: data.foodContext, // AI context for enhanced mode
      });

      // Clear images after successful scan
      setSelectedImages([]);
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
        {/* Header with Profile Button */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.emoji}>📷</Text>
            <Text style={styles.title}>Scan Food</Text>
            <Text style={styles.subtitle}>
              {scanMode === "enhanced"
                ? "AI analyzes 1-3 photos for intelligent context"
                : scanMode === "label"
                ? "Scan nutrition label for accurate values"
                : "Scan actual food for AI estimation"}
            </Text>
          </View>
          <View style={styles.topButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => (navigation as any).navigate("Profile")}
            >
              <Text style={styles.profileButtonText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => (navigation as any).navigate("History")}
            >
              <Text style={styles.historyButtonText}>📜 History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === "enhanced" && styles.modeButtonActive,
            ]}
            onPress={() => {
              setScanMode("enhanced");
              setSelectedImages([]); // Clear images when switching modes
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                scanMode === "enhanced" && styles.modeButtonTextActive,
              ]}
            >
              🧠 AI Enhanced (1-3 photos)
            </Text>
            <Text style={styles.modeSubtext}>Most Intelligent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === "label" && styles.modeButtonActive,
            ]}
            onPress={() => {
              setScanMode("label");
              setSelectedImages([]); // Clear images when switching modes
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                scanMode === "label" && styles.modeButtonTextActive,
              ]}
            >
              📊 Nutrition Label
            </Text>
            <Text style={styles.modeSubtext}>Most Accurate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === "food" && styles.modeButtonActive,
            ]}
            onPress={() => {
              setScanMode("food");
              setSelectedImages([]); // Clear images when switching modes
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                scanMode === "food" && styles.modeButtonTextActive,
              ]}
            >
              🍔 Food Photo
            </Text>
            <Text style={styles.modeSubtext}>AI Estimation</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {selectedImages.length > 0 ? (
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageNumber}>
                    {index + 1}/{selectedImages.length}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.scanButtonText}>
                  {scanMode === "enhanced"
                    ? `🧠 Analyze ${selectedImages.length} Photo${
                        selectedImages.length > 1 ? "s" : ""
                      }`
                    : scanMode === "label"
                    ? "🔍 Analyze Label"
                    : "🤖 Analyze Food"}
                </Text>
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
          {scanMode === "enhanced" ? (
            <>
              <Text style={styles.infoText}>
                • Add 1-3 photos for better AI analysis
              </Text>
              <Text style={styles.infoText}>
                • Include different angles (front, side, top)
              </Text>
              <Text style={styles.infoText}>
                • Show ingredients list if available
              </Text>
              <Text style={styles.infoText}>
                • AI identifies: natural vs added sugar, healthy fats, cooking
                method
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>• Ensure good lighting</Text>
              <Text style={styles.infoText}>
                • Keep the label flat and visible
              </Text>
              <Text style={styles.infoText}>• Avoid shadows and glare</Text>
            </>
          )}
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
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  topButtons: {
    flexDirection: "row",
    gap: 10,
  },
  profileButton: {
    flex: 1,
    backgroundColor: "#9C27B0",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  historyButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  historyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
  modeToggleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  modeButtonActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  modeButtonTextActive: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  modeSubtext: {
    fontSize: 11,
    color: "#999",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageScroll: {
    width: "100%",
    marginBottom: 15,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 15,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#F44336",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageNumber: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
