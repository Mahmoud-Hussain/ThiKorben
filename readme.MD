# ThiKorben (ঠিককরবেন) 🛠️

**ThiKorben** is a location-based mobile platform tailored for Bangladesh, connecting local households with trusted, skilled informal workers such as plumbers, electricians, carpenters, cleaners, and appliance technicians.

Built with **React Native**, **Expo SDK 57**, and **Expo Router**, ThiKorben delivers a bilingual (Bangla / English) user experience for everyday service booking, live tracking, community job board, marketplace shopping, and worker job management.

---

## 📱 Implemented Pages & Features

The platform integrates complete interactive flows for Customers and Workers:

### 1. Core Service & Navigation Flow
| Route | File | Key Features |
| :--- | :--- | :--- |
| `/` | `app/index.tsx` | Entry screen, bilingual (English & বাংলা) toggle, role selection (Customer vs Worker), feature highlights |
| `/customer-dashboard` | `app/customer-dashboard.tsx` | Service grid (Plumber, Electrician, Carpenter, Cleaner), search & filter, emergency dispatch modal, verified pros cards |
| `/worker-dashboard` | `app/worker-dashboard.tsx` | Online/Offline availability toggle, today's earnings counter, incoming job requests (Accept / Decline / Counter), active jobs |
| `/worker-profile` | `app/worker-profile.tsx` | Master profile with ratings & reviews breakdown, fixed service price list, work experience tags, direct Call/Message/Book actions |
| `/job-details` | `app/job-details.tsx` | Problem description & media preview, interactive price negotiation slider, pickup address mini-map, OTP progress flow |
| `/track-worker` | `app/track-worker.tsx` | Interactive **Leaflet / OpenStreetMap** map with live worker marker & route line, real-time ETA countdown, SOS & quick contact |

### 2. Community, Marketplace & Chat
| Route | File | Key Features |
| :--- | :--- | :--- |
| `/community` | `app/community.tsx` | Community posts, neighborhood advice, worker recommendations, upvoting and discussions |
| `/job-board` | `app/job-board.tsx` | Open job marketplace, customer post creation with photo attachment & budget, worker proposals and public comments |
| `/job-chat` | `app/job-chat.tsx` | Direct messaging between customer & worker, AI smart product/material recommendations with instant purchase |
| `/service-checkout` | `app/service-checkout.tsx` | Comprehensive service cost breakdown, materials cost calculation, tip selection, and final billing |

### 3. ThiKorben Shop & Cart
| Route | File | Key Features |
| :--- | :--- | :--- |
| `/shop` | `app/shop.tsx` | Hardware, sanitary, electrical and tool catalog with category filtering and search |
| `/product-details` | `app/product-details.tsx` | Product specifications, warranty details, pricing, reviews, and add to cart |
| `/cart` | `app/cart.tsx` | Shopping cart review, quantity management, express delivery selection, payment method options |

### 4. Auth & Profile Setup
| Route | File | Key Features |
| :--- | :--- | :--- |
| `/auth/login` | `app/auth/login.tsx` | Phone number OTP login screen |
| `/auth/signup` | `app/auth/signup.tsx` | New account registration with validation |
| `/auth/otp-verify` | `app/auth/otp-verify.tsx` | 6-digit OTP verification with countdown timer |
| `/auth/account-exists` | `app/auth/account-exists.tsx` | Account conflict handler |
| `/auth/otp-error` | `app/auth/otp-error.tsx` | Invalid/expired OTP state with retry |
| `/auth/otp-success` | `app/auth/otp-success.tsx` | Verified state animation and redirect |
| `/customer-profile-setup` | `app/customer-profile-setup.tsx` | Customer saved address, emergency contact configuration |
| `/worker-profile-setup` | `app/worker-profile-setup.tsx` | Worker trade selection, hourly rate, and service radius setup |
| `/logout-confirmation` | `app/logout-confirmation.tsx` | Session logout confirmation |

---

## 🧩 Reusable Components & Architecture

- **`components/page-quick-switcher.tsx`**: Floating interactive drawer with categorized links to instantly navigate to all 17+ screens during review.
- **`components/bottom-nav-bar.tsx`**: Persistent bottom navigation bar adapting between Customer and Worker tabs.
- **`components/leaflet-map.tsx` / `components/leaflet-map.web.tsx`**: Cross-platform Leaflet mapping component using `react-native-webview` on Native and iframe on Web.
- **`contexts/session-context.tsx`**: Shared session state management across Customer and Worker profiles.
- **`components/logout-modal.tsx`**: Reusable confirmation modal for session teardown.

---

## 🛠️ Technology Stack

- **Framework**: Expo `v57.0.0` (React Native `0.86.3`, React `19.2.3`)
- **Navigation / Routing**: Expo Router `v57.0.17` (File-based routing)
- **Maps**: Leaflet + OpenStreetMap (via WebView on Native / iframe on Web)
- **Icons**: `@expo/vector-icons` (Ionicons, MaterialIcons, MaterialCommunityIcons)
- **Languages**: TypeScript, Full Bilingual UI (English & Bangla)

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Expo server**:
   ```bash
   npm start
   ```

3. **Open on target platform**:
   - Press **`w`** for Web preview in browser (`http://localhost:8081`)
   - Press **`a`** for Android Emulator / connected device
   - Press **`i`** for iOS Simulator
   - Scan terminal QR code with **Expo Go** on your phone

---

## 🔀 Git Workflow & Branch Status

All feature branches have been merged into **`dev`**:
- `origin/main`
- `origin/master`
- `origin/feature/customer-auth`
- `origin/feature/profile-and-session-ui`
- `origin/feature/community-marketplace-flow` (including `thik-korben-shop`, `service-checkout-summary`, `ai-product-recommendation`, `job-chat`, `job-post-and-proposals`)
- `origin/feature/welcome-screen`
- `origin/feature/customer-home`
- `origin/feature/worker-dashboard`
- `origin/feature/worker-profile`
- `origin/feature/tracking-ui`
- `origin/feature/job-details-and-map`
- `origin/feature/leaflet-map`
- `origin/feature/worker-rate`
- `origin/feature/booking-ui`
- `origin/feature/ratings-reviews`
- `origin/feature/auth-ui`
