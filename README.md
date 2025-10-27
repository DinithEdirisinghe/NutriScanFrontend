# NutriScore AI - Mobile App (React Native)

## 📱 Phase 2: Mobile Frontend

This is the React Native mobile application for NutriScore AI, built with Expo and TypeScript.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (already installed if backend works)
- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Backend running** on `http://localhost:3000`

### Installation

```powershell
# Navigate to frontend folder
cd d:\NutriScan\frontend

# Install dependencies (already done)
npm install
```

### Running the App

1. **Start the backend first:**

   ```powershell
   cd d:\NutriScan\backend
   docker-compose up -d postgres
   npm run dev
   ```

2. **Start the mobile app:**

   ```powershell
   cd d:\NutriScan\frontend
   npm start
   ```

3. **Open on your device:**
   - Scan the QR code with **Expo Go** app
   - Or press `w` for web browser (limited camera functionality)
   - Or press `a` for Android emulator (needs Android Studio)
   - Or press `i` for iOS simulator (Mac only, needs Xcode)

---

## 📁 Project Structure

```
frontend/
├── App.tsx                   # Main app entry with navigation
├── src/
│   ├── screens/              # Screen components
│   │   ├── LoginScreen.tsx   # Login/Register screen
│   │   ├── ProfileScreen.tsx # User health profile screen
│   │   └── ScannerScreen.tsx # Camera/Image picker screen
│   ├── context/
│   │   └── AuthContext.tsx   # Global authentication state
│   ├── services/
│   │   └── api.ts            # Backend API calls (Axios)
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── components/           # Reusable UI components (future)
│   └── config.ts             # App configuration
├── package.json
└── tsconfig.json
```

---

## 🔧 Configuration

### Backend API URL

Update `src/config.ts` based on your device:

| Device Type          | URL Example                                          |
| -------------------- | ---------------------------------------------------- |
| **Android Emulator** | `http://10.0.2.2:3000/api`                           |
| **iOS Simulator**    | `http://localhost:3000/api`                          |
| **Physical Device**  | `http://192.168.1.100:3000/api` (your computer's IP) |

**Find your IP on Windows:**

```powershell
ipconfig
# Look for "IPv4 Address" under your Wi-Fi adapter
```

---

## 🎨 Screens Overview

### 1. Login Screen

- **Route:** `Login` (shown when not authenticated)
- **Features:**
  - Email/password login
  - User registration
  - Toggle between login/register modes
  - Form validation
  - JWT token storage

### 2. Profile Screen

- **Route:** `Profile` (main tab)
- **Features:**
  - View user email
  - Edit health metrics:
    - Blood Sugar (mg/dL)
    - LDL Cholesterol (mg/dL)
    - Weight (kg)
    - Height (cm)
  - Save changes to backend
  - Logout functionality

### 3. Scanner Screen

- **Route:** `Scanner` (main tab)
- **Features:**
  - Camera capture
  - Gallery image picker
  - Image preview
  - Placeholder for OCR scanning (Phase 3)

---

## 🔐 Authentication Flow

1. **App Launch:**

   - Check AsyncStorage for saved token
   - If token exists → Auto-login
   - If no token → Show login screen

2. **Login/Register:**

   - User enters credentials
   - API call to backend
   - Store JWT token in AsyncStorage
   - Navigate to main app

3. **Protected Requests:**

   - Token automatically added to all API requests
   - If token expires (401 error) → Auto-logout

4. **Logout:**
   - Clear AsyncStorage
   - Navigate back to login screen

---

## 📦 Key Dependencies

| Package                                     | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `expo`                                      | React Native framework           |
| `@react-navigation/native`                  | Screen navigation                |
| `@react-navigation/bottom-tabs`             | Tab bar navigation               |
| `axios`                                     | HTTP requests to backend         |
| `@react-native-async-storage/async-storage` | Persistent storage for JWT token |
| `expo-image-picker`                         | Camera and gallery access        |
| `typescript`                                | Type safety                      |

---

## 🧪 Testing the App

### Test Login Flow

1. Start the app
2. Click "Register" toggle
3. Enter email: `test@nutriscore.com`
4. Enter password: `password123`
5. Click "Register"
6. Should navigate to Scanner screen

### Test Profile Update

1. Navigate to Profile tab
2. Enter health metrics:
   - Blood Sugar: `95`
   - LDL Cholesterol: `120`
   - Weight: `75.5`
   - Height: `175`
3. Click "Save Changes"
4. Should see success alert

### Test Image Picker

1. Navigate to Scanner tab
2. Click "Take Photo" or "Choose from Gallery"
3. Select an image
4. Should display image preview
5. Click "Analyze Label" → Shows "Coming Soon" (Phase 3)

---

## 🎓 What You Learned (Phase 2)

### React Native Concepts

- **Components:** Building blocks of UI (`View`, `Text`, `TextInput`, etc.)
- **StyleSheet:** CSS-like styling for mobile
- **State:** Managing data with `useState`
- **Effects:** Running code on mount with `useEffect`
- **Navigation:** Moving between screens

### React Navigation

- **Stack Navigator:** Push/pop screen transitions
- **Tab Navigator:** Bottom tab bar
- **Conditional Navigation:** Show different screens based on auth state

### React Context API

- **Global State:** Share data across entire app
- **Custom Hooks:** `useAuth()` to access context
- **Providers:** Wrap app with `<AuthProvider>`

### Async Storage

- **Persistent Storage:** Like localStorage for mobile
- **Token Management:** Store JWT securely
- **Auto-login:** Check token on app startup

### API Integration

- **Axios Interceptors:** Add token to all requests automatically
- **Error Handling:** Catch network errors and token expiration
- **TypeScript Types:** Type-safe API responses

---

## 🐛 Troubleshooting

### Backend Connection Failed

**Error:** "Network Error" or "Connection refused"

**Solution:**

1. Make sure backend is running: `cd backend; npm run dev`
2. Update `src/config.ts` with correct URL for your device
3. Ensure phone/emulator is on same Wi-Fi as computer (for physical device)

### Camera Not Working

**Error:** "Permission denied"

**Solution:**

1. Grant camera permissions when prompted
2. Restart the app
3. On physical device, check app permissions in phone settings

### Token Not Persisting

**Error:** Logged out after closing app

**Solution:**

1. Check if AsyncStorage is working: `npm list @react-native-async-storage/async-storage`
2. Clear app data and try again

---

## 🚀 Next Steps (Phase 3)

In Phase 3, we'll add the **core functionality**:

1. **Backend OCR Integration:**

   - Google Vision API for text extraction
   - Nutrition label parser

2. **Deterministic Scoring Engine:**

   - Mathematical formula implementation
   - No LLM for score calculation

3. **Results Screen:**
   - Display 0-100% score
   - Show AI-generated advice
   - Visualize health impact

---

## 📸 Screenshots

(Coming soon - you can add screenshots here after testing!)

---

**✅ Phase 2 Complete!** You now have a fully functional mobile app with authentication, profile management, and image picking! 🎉
