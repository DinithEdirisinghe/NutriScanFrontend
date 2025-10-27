import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, userAPI } from "../services/api";
import { User, LoginCredentials } from "../types";

// Define what our context provides
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Removed automatic auth loading on mount - will load manually after login
  // This avoids AsyncStorage issues during initial render

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);

      // Store token and user data
      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.register(credentials);

      // Store token and user data
      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshProfile = async () => {
    try {
      const updatedUser = await userAPI.getProfile();
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user), // Explicit boolean conversion
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
