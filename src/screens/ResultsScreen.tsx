import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface NutritionData {
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
}

interface HealthScore {
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
}

interface Props {
  route: {
    params: {
      nutritionData: NutritionData;
      healthScore: HealthScore;
    };
  };
}

export default function ResultsScreen({ route }: Props) {
  const navigation = useNavigation();
  const { nutritionData, healthScore } = route.params;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#8BC34A"; // Light Green
    if (score >= 40) return "#FFC107"; // Yellow
    if (score >= 20) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "Excellent":
        return "🌟";
      case "Good":
        return "👍";
      case "Fair":
        return "😐";
      case "Poor":
        return "👎";
      case "Very Poor":
        return "❌";
      default:
        return "📊";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Health Score</Text>
        <View
          style={[
            styles.scoreCircle,
            { borderColor: getScoreColor(healthScore.overallScore) },
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              { color: getScoreColor(healthScore.overallScore) },
            ]}
          >
            {healthScore.overallScore}
          </Text>
          <Text style={styles.scoreOutOf}>/100</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryEmoji}>
            {getCategoryEmoji(healthScore.category)}
          </Text>
          <Text style={styles.categoryText}>{healthScore.category}</Text>
        </View>
      </View>

      {/* Breakdown Scores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Detailed Breakdown</Text>

        <ScoreBar
          label="Sugar"
          score={healthScore.breakdown.sugarScore}
          icon="🍬"
        />
        <ScoreBar
          label="Fat"
          score={healthScore.breakdown.fatScore}
          icon="🧈"
        />
        <ScoreBar
          label="Sodium"
          score={healthScore.breakdown.sodiumScore}
          icon="🧂"
        />
        <ScoreBar
          label="Calories"
          score={healthScore.breakdown.calorieScore}
          icon="🔥"
        />
      </View>

      {/* Nutrition Facts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥗 Nutrition Facts</Text>
        <View style={styles.nutritionGrid}>
          {nutritionData.servingSize && (
            <NutritionItem label="Serving" value={nutritionData.servingSize} />
          )}
          {nutritionData.calories !== undefined && (
            <NutritionItem
              label="Calories"
              value={`${nutritionData.calories} cal`}
            />
          )}
          {nutritionData.totalFat !== undefined && (
            <NutritionItem
              label="Total Fat"
              value={`${nutritionData.totalFat}g`}
            />
          )}
          {nutritionData.saturatedFat !== undefined && (
            <NutritionItem
              label="Saturated Fat"
              value={`${nutritionData.saturatedFat}g`}
            />
          )}
          {nutritionData.transFat !== undefined && (
            <NutritionItem
              label="Trans Fat"
              value={`${nutritionData.transFat}g`}
            />
          )}
          {nutritionData.cholesterol !== undefined && (
            <NutritionItem
              label="Cholesterol"
              value={`${nutritionData.cholesterol}mg`}
            />
          )}
          {nutritionData.sodium !== undefined && (
            <NutritionItem label="Sodium" value={`${nutritionData.sodium}mg`} />
          )}
          {nutritionData.totalCarbohydrates !== undefined && (
            <NutritionItem
              label="Total Carbs"
              value={`${nutritionData.totalCarbohydrates}g`}
            />
          )}
          {nutritionData.dietaryFiber !== undefined && (
            <NutritionItem
              label="Dietary Fiber"
              value={`${nutritionData.dietaryFiber}g`}
            />
          )}
          {nutritionData.sugars !== undefined && (
            <NutritionItem label="Sugars" value={`${nutritionData.sugars}g`} />
          )}
          {nutritionData.protein !== undefined && (
            <NutritionItem
              label="Protein"
              value={`${nutritionData.protein}g`}
            />
          )}
        </View>
      </View>

      {/* Warnings */}
      {healthScore.warnings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Health Warnings</Text>
          {healthScore.warnings.map((warning, index) => (
            <View key={index} style={styles.warningItem}>
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {healthScore.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Recommendations</Text>
          {healthScore.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.scanAgainButtonText}>📸 Scan Another Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper Components
function ScoreBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: string;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return "#4CAF50";
    if (s >= 60) return "#8BC34A";
    if (s >= 40) return "#FFC107";
    if (s >= 20) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>
          {icon} {label}
        </Text>
        <Text style={[styles.scoreBarValue, { color: getColor(score) }]}>
          {score}/100
        </Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            {
              width: `${score}%`,
              backgroundColor: getColor(score),
            },
          ]}
        />
      </View>
    </View>
  );
}

function NutritionItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutritionItem}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scoreCard: {
    backgroundColor: "#fff",
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreOutOf: {
    fontSize: 16,
    color: "#666",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  scoreBarContainer: {
    marginBottom: 15,
  },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreBarLabel: {
    fontSize: 14,
    color: "#666",
  },
  scoreBarValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  nutritionItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    minWidth: "45%",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  warningItem: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningText: {
    fontSize: 14,
    color: "#C62828",
  },
  recommendationItem: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  recommendationText: {
    fontSize: 14,
    color: "#1565C0",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  scanAgainButton: {
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  scanAgainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
