import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

interface ScanHistoryItem {
  id: string;
  scanType: "label" | "food";
  foodName: string | null;
  overallScore: number;
  confidenceLevel: string | null;
  createdAt: string;
}

export default function HistoryScreen({ navigation }: any) {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for authentication errors
      if (response.status === 401) {
        console.log("❌ Token expired or invalid, redirecting to login");
        await AsyncStorage.removeItem("authToken");
        navigation.replace("Login");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setScans(data.scans);
      } else {
        console.error("Failed to fetch history:", data.message);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const viewScanDetails = async (scanId: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/history/${scanId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Navigate to Results screen with historical data
        navigation.navigate("Results", {
          nutritionData: data.scan.nutritionData,
          healthScore: data.scan.healthScore,
          scanType: data.scan.scanType,
          foodName: data.scan.foodName,
          confidence: data.scan.confidenceLevel,
          isHistorical: true, // Flag to hide "Scan Again" button
        });
      }
    } catch (error) {
      console.error("Error fetching scan details:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderScanItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity
      style={styles.scanCard}
      onPress={() => viewScanDetails(item.id)}
    >
      <View style={styles.scanHeader}>
        <View style={styles.scanTypeContainer}>
          <Text style={styles.scanTypeIcon}>
            {item.scanType === "food" ? "🍔" : "📊"}
          </Text>
          <Text style={styles.scanTypeText}>
            {item.scanType === "food" ? "Food Photo" : "Nutrition Label"}
          </Text>
        </View>
        <Text style={styles.scanDate}>{formatDate(item.createdAt)}</Text>
      </View>

      {item.foodName && <Text style={styles.foodName}>{item.foodName}</Text>}

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Health Score:</Text>
        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(item.overallScore) },
          ]}
        >
          {item.overallScore}/100
        </Text>
      </View>

      {item.confidenceLevel && (
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>
            Confidence: {item.confidenceLevel}
          </Text>
        </View>
      )}

      <Text style={styles.viewDetails}>Tap to view details →</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📜 Scan History</Text>
        <Text style={styles.headerSubtitle}>
          {scans.length} scan{scans.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>
            Start scanning nutrition labels or food photos!
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate("Scanner")}
          >
            <Text style={styles.scanButtonText}>📸 Scan Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E8F5E9",
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  scanCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scanTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  scanTypeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  scanDate: {
    fontSize: 12,
    color: "#999",
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  confidenceContainer: {
    marginTop: 5,
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#9C27B0",
    fontStyle: "italic",
  },
  viewDetails: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
