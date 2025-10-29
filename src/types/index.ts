// User-related types matching backend structure
export interface User {
  id: string;
  email: string;
  blood_sugar_mg_dl?: number;
  ldl_cholesterol_mg_dl?: number;
  weight_kg?: number;
  height_cm?: number;
  scoringMode?: 'portion-aware' | 'per-100g';
}

// Authentication response from backend
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Login/Register credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// User profile update payload
export interface ProfileUpdatePayload {
  blood_sugar_mg_dl?: number;
  ldl_cholesterol_mg_dl?: number;
  weight_kg?: number;
  height_cm?: number;
  scoringMode?: 'portion-aware' | 'per-100g';
}

// Scan result (for Phase 3)
export interface ScanResult {
  score: number;
  advice?: string;
  nutritionFacts?: any;
}
