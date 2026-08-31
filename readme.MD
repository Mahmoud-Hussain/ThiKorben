# ThiKorben (ঠিককরবেন) 🛠️

**ThiKorben** is a location-based mobile platform designed for Bangladesh to connect local households with trusted, skilled informal workers such as plumbers, electricians, carpenters, cleaners, and appliance technicians.

Built with **React Native**, **Expo SDK 57**, and **Expo Router**, ThiKorben offers a bilingual (Bangla / English) user experience tailored for everyday service booking, live tracking, and worker job management.

---

## 📱 Live / Implemented Pages & Features

The mobile frontend UI has been built with an interactive flow across both Customer and Worker journeys:

| Page / Route | File | Status | Key Features |
| :--- | :--- | :---: | :--- |
| **Welcome / Onboarding** | `app/welcome.tsx` | ✅ **Working** | • English & বাংলা language selector<br>• Customer vs. Worker role toggle<br>• Visual feature highlights & trust badges |
| **Customer Home / Dashboard** | `app/index.tsx` | ✅ **Working** | • Service bento grid (Plumber, Electrician, Carpenter, Cleaner)<br>• Search bar with real-time filtering<br>• Emergency Request modal with instant dispatch simulation<br>• Verified Pros list with ratings, specialty, distance & visiting fees<br>• Active tracking status banner |
| **Worker Dashboard** | `app/worker-dashboard.tsx` | ✅ **Working** | • Online / Offline availability toggle switch<br>• Today's earnings counter & completed job statistics<br>• Incoming job request cards with Accept / Decline / Counter-offer actions<br>• Active ongoing job status overview |
| **Worker Profile** | `app/worker-profile.tsx` | ✅ **Working** | • Verified Master Plumber profile (Rahim Uddin)<br>• Ratings breakdown & verified customer reviews<br>• Fixed service price cards (Leak repair, pipe fitting, etc.)<br>• Work history & experience tags<br>• Direct Call, Message, and Book Now actions |
| **Job Details & Negotiation** | `app/job-details.tsx` | ✅ **Working** | • Customer problem description & media preview<br>• Interactive price negotiation / counter-offer slider<br>• Pickup & job site address with mini-map<br>• Job progress milestones & OTP verification flow |
| **Live Worker Tracking** | `app/track-worker.tsx` | ✅ **Working** | • Interactive **Leaflet / OpenStreetMap** map with live worker marker & route line<br>• Real-time ETA and distance countdown (e.g., 12 min away in Dhanmondi)<br>• Worker quick contact card (Call / Chat)<br>• Safety SOS button & Cancel options |

---

## 🧩 Reusable Components

- **`components/bottom-nav-bar.tsx`**: Persistent bottom navigation bar adapting between Customer and Worker tabs.
- **`components/leaflet-map.tsx` / `components/leaflet-map.web.tsx`**: Cross-platform Leaflet mapping component using `react-native-webview` on Native and iframe on Web.
- **`components/page-quick-switcher.tsx`**: Floating quick switcher button allowing instant switching between all 6 screens during review and development.

---

## 🛠️ Technology Stack

### Frontend (Implemented)
- **Framework**: Expo `v57.0.0` (React Native `0.86.3`, React `19.2.3`)
- **Navigation / Routing**: Expo Router `v57.0.17` (File-based routing)
- **Maps**: Leaflet + OpenStreetMap (via WebView / Web)
- **Icons**: `@expo/vector-icons` (Ionicons, MaterialIcons, MaterialCommunityIcons)
- **Languages**: TypeScript, Full Bilingual UI (English & Bangla)

### Planned Backend & Infrastructure
- **Server**: NestJS (TypeScript REST & WebSocket API)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Firebase Phone Auth / Twilio SMS OTP
- **Payments**: bKash, Nagad, SSLCommerz, Cash on Delivery

---

## 🚀 Running the Project Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

3. **Run on target platform**:
   - Press **`w`** for Web preview in browser (`http://localhost:8081`)
   - Press **`a`** for Android Emulator / connected device
   - Press **`i`** for iOS Simulator
   - Scan the terminal QR code using **Expo Go** on your phone (or press **`s`** to toggle development build)

---

## 📋 What is Left / Roadmap

### Phase 2: Authentication & User Profiles
- [ ] Phone number SMS OTP login / signup (Bangladeshi +880 numbers)
- [ ] Customer profile setup (Name, saved addresses, emergency contacts)
- [ ] Worker onboarding flow (NID verification, skill/trade selection, rate configuration)

### Phase 3: Backend & Database Integration
- [ ] NestJS API setup with PostgreSQL database
- [ ] Real-time WebSocket connection for instant worker job dispatch
- [ ] Location radius search (PostGIS / Haversine distance queries)
- [ ] Job state machine (Requested → Accepted → In-Transit → In-Progress → Completed → Paid)

### Phase 4: Real-time Communication & Notifications
- [ ] In-app chat messaging between customer and worker
- [ ] Push notifications (Expo Push Notifications / FCM)
- [ ] Live GPS tracking using device geolocation (`expo-location`)

### Phase 5: Payments & Reviews
- [ ] Bangladeshi payment gateway integration (bKash, Nagad, Card)
- [ ] Cash-on-delivery collection & commission tracking
- [ ] Post-job rating, review submission, and worker tipping system

---

## 🔀 Git Workflow

```text
main (stable releases)
  │
  └── dev (active development)
       │
       ├── feature/welcome-screen
       ├── feature/customer-home
       ├── feature/worker-dashboard
       ├── feature/worker-profile
       ├── feature/job-details-and-map
       ├── feature/tracking-ui
       └── feature/backend-api
```
