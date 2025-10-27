import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./src/config";
import ScannerScreen from "./src/screens/ScannerScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  Scanner: undefined;
  Results: {
    nutritionData: {
      calories?: number;
      totalFat?: number;
      saturatedFat?: number;
      transFat?: number;
      cholesterol?: number;
      sodium?: number;
      totalCarbohydrates?: number;
      dietaryFiber?: number;
      sugars?: number;
      protein?: number;
      servingSize?: string;
    };
    healthScore: {
      overallScore: number;
      breakdown: {
        sugarScore: number;
        fatScore: number;
        sodiumScore: number;
        calorieScore: number;
      };
      warnings: string[];
      recommendations: string[];
      category: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Login screen component
type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Call the backend API
      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
      const fullUrl = `${API_BASE_URL}${endpoint}`;

      console.log("🔗 Calling API:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);

      const data = await response.json();

      console.log("📦 Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Store the token
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("userEmail", data.user.email);

      // Success! Navigate to Scanner screen
      if (isLoginMode) {
        // Login successful - navigate to Scanner
        navigation.replace("Scanner");
      } else {
        // Registration successful - show alert then navigate
        Alert.alert(
          "Success! 🎉",
          "Registration successful! Welcome to NutriScore AI.",
          [
            {
              text: "OK",
              onPress: () => navigation.replace("Scanner"),
            },
          ]
        );
      }

      console.log("User data:", data.user);
      console.log("Token:", data.token);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Network error. Make sure backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🥗</Text>
          <Text style={styles.title}>NutriScore AI</Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? "Welcome Back!" : "Create Account"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLoginMode ? "Login" : "Register"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle between login/register */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsLoginMode(!isLoginMode)}
          >
            <Text style={styles.toggleText}>
              {isLoginMode
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Main app component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ title: "Scan Nutrition Label" }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: "Analysis Results" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#4CAF50",
    fontSize: 14,
  },
});
