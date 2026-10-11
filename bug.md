# 🐛 ThiKorben — Bug Report
> Generated: 2026-10-11 | Analysed all 7 screens + 4 components

---

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 2 |
| 🟠 High | 6 |
| 🟡 Medium | 7 |
| 🔵 Low / UX | 6 |
| **Total** | **21** |

---

## 🔴 Critical Bugs

---

### BUG-001 · Welcome screen routes Customer button back to itself
**File:** [`app/welcome.tsx`](app/welcome.tsx) — Line 155  
**Severity:** 🔴 Critical  
**Type:** Wrong navigation target

**Description:**  
The "I Need a Service" (Customer) button on the Welcome screen pushes to `'/'` (the Customer Dashboard index route), which is also `app/index.tsx`. This means pressing the button navigates to the same dashboard but adds it to the navigation stack — so pressing Back brings you back to Welcome rather than exiting. More importantly, the route resolves identically to the current root, causing confusion on first launch.

**Code:**
```tsx
// app/welcome.tsx L155 — pushes to '/' which IS the customer dashboard already
onPress={() => router.push('/')}
```

**Fix:**
```tsx
// Should use router.replace to avoid stacking, or navigate directly to '/'
onPress={() => router.replace('/')}
```

---

### BUG-002 · `bottomBar` in `job-details.tsx` and `worker-profile.tsx` overlaps `BottomNavBar`
**Files:** [`app/job-details.tsx`](app/job-details.tsx) L249, [`app/worker-profile.tsx`](app/worker-profile.tsx) L265  
**Severity:** 🔴 Critical  
**Type:** Layout / rendering overlap

**Description:**  
Both screens position a sticky action bar using `position: 'absolute', bottom: 64 + Math.max(insets.bottom, 10)`. The value `64` is a hardcoded guess at the `BottomNavBar` height. On devices where the nav bar is taller (e.g. iPhone with Dynamic Island, some Android OEMs), the action bar overlaps the nav bar or floats too high, making the primary CTA ("Complete Job", "Book Now") unreachable or visually broken.

**Code:**
```tsx
// job-details.tsx L249 — hardcoded 64 is fragile
<View style={[styles.bottomBar, { bottom: 64 + Math.max(insets.bottom, 10) }]}>
```

**Fix:**  
Export the `BottomNavBar` height as a constant and use it, or restructure to use a non-absolute layout (flex column with the bar inside the view hierarchy instead of absolutely positioned).

---

## 🟠 High Bugs

---

### BUG-003 · `router.back()` crashes when navigated directly to deep screens
**Files:** [`app/job-details.tsx`](app/job-details.tsx) L81, [`app/worker-profile.tsx`](app/worker-profile.tsx) L109, [`app/track-worker.tsx`](app/track-worker.tsx) L68  
**Severity:** 🟠 High  
**Type:** Runtime crash / unhandled navigation state

**Description:**  
All three screens use `router.back()` on the Back button with no guard. If the user opens the app directly on one of these screens (e.g. via deep link, or after clearing navigation history), `router.back()` throws a "Cannot go back" error or silently fails, leaving the user stuck with no way to navigate away.

**Fix:**
```tsx
import { router } from 'expo-router';

// Replace all bare router.back() calls with:
const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
};
```

---

### BUG-004 · HTML entity strings rendered as literal text in JSX
**Files:** [`app/worker-dashboard.tsx`](app/worker-dashboard.tsx) L209, [`app/job-details.tsx`](app/job-details.tsx) L158  
**Severity:** 🟠 High  
**Type:** Rendering bug (visual defect)

**Description:**  
JSX text nodes contain HTML entities (`&apos;`, `&quot;`) copied from an HTML source. React Native's `<Text>` component does **not** process HTML entities — they are rendered as-is on screen.

- `worker-dashboard.tsx` L209: `Today&apos;s Earnings` → renders as `Today&apos;s Earnings`
- `job-details.tsx` L158: `&quot;Water is leaking...&quot;` → renders with literal `&quot;` chars

**Fix:**
```tsx
// worker-dashboard.tsx L209
<Text>Today's Earnings</Text>

// job-details.tsx L158
<Text>"Water is leaking under the kitchen sink..."</Text>
```

---

### BUG-005 · `pro.id` used as list key — all three pros share the same route on press
**File:** [`app/index.tsx`](app/index.tsx) L409–L451  
**Severity:** 🟠 High  
**Type:** Logic bug — navigation does not pass context

**Description:**  
All pro cards in the "Verified Pros Near You" list navigate to the hardcoded route `'/worker-profile'` regardless of which worker is tapped. There's no `id` parameter passed via the route. This means tapping "Karim" or "Kamal" always shows Rahim's profile.

**Code:**
```tsx
onPress={() => router.push('/worker-profile')}  // Always shows Rahim
```

**Fix:**  
Pass the worker ID as a route param and make `worker-profile.tsx` accept and display dynamic data:
```tsx
onPress={() => router.push({ pathname: '/worker-profile', params: { workerId: pro.id } })}
```

---

### BUG-006 · `customer-dashboard.tsx` is an empty shell — it's unreachable and unlinked
**File:** [`app/customer-dashboard.tsx`](app/customer-dashboard.tsx)  
**Severity:** 🟠 High  
**Type:** Dead code / broken route

**Description:**  
The file `app/customer-dashboard.tsx` exists as a route (`/customer-dashboard`) but its contents are only 36 bytes — essentially an empty component. Nothing in the app links to it. Expo Router will expose this as a reachable URL that renders a blank screen, which could confuse users via deep links.

**Fix:**  
Either delete the file or implement the screen. If it's a placeholder, at minimum add a redirect:
```tsx
// app/customer-dashboard.tsx
import { Redirect } from 'expo-router';
export default function CustomerDashboard() {
  return <Redirect href="/" />;
}
```

---

### BUG-007 · `COLORS` constant is redefined independently in every screen file
**Files:** All 6 screen files + `constants/theme.ts`  
**Severity:** 🟠 High  
**Type:** Maintainability / DRY violation with inconsistency risk

**Description:**  
Each screen defines its own `COLORS` (or `C`) object with overlapping but slightly different values. `constants/theme.ts` already exists but is **never imported** by any screen. For example:
- `index.tsx` uses `success: '#27AE60'`
- `worker-dashboard.tsx` uses `success: '#16a34a'`
- `track-worker.tsx` uses `greenSuccess: '#27AE60'`

These inconsistencies mean the UI uses mismatched greens across screens. Any future rebrand must be done in 6+ places.

**Fix:**  
Import and use `constants/theme.ts` in all screens instead of redefining colours locally.

---

### BUG-008 · Review stars always render 5 filled stars regardless of `rev.rating`
**File:** [`app/worker-profile.tsx`](app/worker-profile.tsx) L252–L254  
**Severity:** 🟠 High  
**Type:** Logic bug — UI does not reflect data

**Description:**  
The review star renderer always maps `[1, 2, 3, 4, 5]` to 5 filled yellow stars, ignoring `rev.rating`. Shamim Hossain's review has `rating: 4.8` but displays 5/5 stars.

**Code:**
```tsx
{[1, 2, 3, 4, 5].map((s) => (
  <MaterialIcons key={s} name="star" size={13} color="#eab308" /> // always filled
))}
```

**Fix:**
```tsx
{[1, 2, 3, 4, 5].map((s) => (
  <MaterialIcons
    key={s}
    name={s <= Math.round(rev.rating) ? 'star' : 'star-border'}
    size={13}
    color="#eab308"
  />
))}
```

---

## 🟡 Medium Bugs

---

### BUG-009 · Active tracking banner is always visible — no conditional state
**File:** [`app/index.tsx`](app/index.tsx) L221–L233  
**Severity:** 🟡 Medium  
**Type:** Missing state guard

**Description:**  
The "Rahim is on the way" orange tracking banner is unconditionally rendered at all times. Even if no booking exists, a new customer who has never booked anyone sees this banner. There's no `isTracking` state or context to conditionally show it.

**Fix:**  
Add an `isActiveTracking` state (defaulting to `false`) and only render the banner when true:
```tsx
const [isActiveTracking] = useState(false); // wire to real booking state later
{isActiveTracking && <TouchableOpacity style={styles.activeTrackingCard} ...>}
```

---

### BUG-010 · `worker-dashboard.tsx` urgent banner is hardcoded — ignores `isOnline` state
**File:** [`app/worker-dashboard.tsx`](app/worker-dashboard.tsx) L177–L204  
**Severity:** 🟡 Medium  
**Type:** Logic bug — UI inconsistency

**Description:**  
The urgent "NEW INCOMING JOB" banner is always displayed regardless of whether the worker toggled themselves offline. A worker who is offline should not receive incoming job banners.

**Fix:**
```tsx
{isOnline && (
  <View style={styles.urgentBanner}>
    ...
  </View>
)}
```

---

### BUG-011 · `handleCallWorker` / `handleCallCustomer`: `Linking.openURL` fallback logic is inverted
**Files:** [`app/track-worker.tsx`](app/track-worker.tsx) L51–L53, [`app/job-details.tsx`](app/job-details.tsx) L68–L70, [`app/worker-profile.tsx`](app/worker-profile.tsx) L83–L85  
**Severity:** 🟡 Medium  
**Type:** Logic bug — error handler fires on success on web

**Description:**  
The `.catch()` block is used as a fallback when the `tel:` URL cannot be opened. However, on **web**, `Linking.openURL('tel:...')` resolves (doesn't throw) but does nothing — so the `Alert` fallback never fires. Meanwhile, on some Android devices where the dialler app IS available, the `.catch()` fires incorrectly after a brief delay due to async timing.

The phone number itself is also a placeholder (`+8801700000000`) — a dummy that should not appear in production.

**Fix:**  
Use `Linking.canOpenURL()` first:
```tsx
const handleCallWorker = async () => {
  const url = 'tel:+8801700000000';
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    Linking.openURL(url);
  } else {
    Alert.alert('Call Worker', 'Phone calls are not supported on this device.');
  }
};
```

---

### BUG-012 · Job step action button icon missing for `currentStep === 0`
**File:** [`app/job-details.tsx`](app/job-details.tsx) L255–L263  
**Severity:** 🟡 Medium  
**Type:** Logic bug — missing case in ternary

**Description:**  
The icon ternary for the advance-step button handles steps 1, 2, 3 and falls back to `'check-circle'` for step 4. But `currentStep === 0` ("Start Trip") also falls into the `else` branch and gets `'check-circle'` instead of a more appropriate icon like `'navigation'`.

**Code:**
```tsx
name={
  currentStep === 1 ? 'navigation' :
  currentStep === 2 ? 'map-marker-check' :
  currentStep === 3 ? 'hammer-wrench' :
  'check-circle'   // ← also matches step 0!
}
```

**Fix:**
```tsx
name={
  currentStep === 0 ? 'play-circle' :
  currentStep === 1 ? 'navigation' :
  currentStep === 2 ? 'map-marker-check' :
  currentStep === 3 ? 'hammer-wrench' :
  'check-circle'
}
```

---

### BUG-013 · `marginLeft: 'auto'` in `worker-dashboard.tsx` StyleSheet is not valid in React Native
**File:** [`app/worker-dashboard.tsx`](app/worker-dashboard.tsx) L715  
**Severity:** 🟡 Medium  
**Type:** Invalid style — silently ignored on native

**Description:**  
`marginLeft: 'auto'` is valid CSS but is **not supported** in React Native's layout engine (Yoga). On Android/iOS it is silently ignored, meaning the job-card arrow chevron will not be right-aligned as intended. It only works on web.

**Code:**
```tsx
jobArrow: {
  marginLeft: 'auto',   // ❌ Yoga does not support 'auto' margins
},
```

**Fix:**
```tsx
jobCardFooter: {
  // Already has: flexDirection: 'row', alignItems: 'center'
  // Change jobArrow to use flex to push right:
},
jobArrow: {
  flex: 1,
  alignItems: 'flex-end',
},
```

---

### BUG-014 · `pulseDot` in tracking banner has no animation — misleadingly named
**File:** [`app/index.tsx`](app/index.tsx) L225–L227, L647–L652  
**Severity:** 🟡 Medium  
**Type:** Missing implementation (UX deception)

**Description:**  
The `pulseDot` / `pulseDotWrapper` styles exist but the dot is static — there is no `Animated` or `react-native-reanimated` pulse loop. The name and design imply a live animation, but the user sees a static orange circle, reducing perceived reliability of the tracking indicator.

**Fix:**  
Implement a scale pulse using Reanimated (already a project dependency):
```tsx
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const scale = useSharedValue(1);
scale.value = withRepeat(withTiming(1.4, { duration: 800 }), -1, true);
const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
// <Animated.View style={[styles.pulseDotWrapper, animStyle]}>
```

---

### BUG-015 · `insets.bottom` padding calculation used in `welcome.tsx` — but screen has no bottom nav
**File:** [`app/welcome.tsx`](app/welcome.tsx) L117  
**Severity:** 🟡 Medium  
**Type:** Incorrect layout padding

**Description:**  
The Welcome screen applies `paddingBottom: Math.max(insets.bottom, 20) + 40` to its `ScrollView`. However, the bottom nav bar on this screen (`BottomNavBar activeTab="home"`) sits outside the `ScrollView`. This means there's excessive bottom padding on devices with no home indicator, and on devices with one (iPhone), the scroll area is doubly padded.

---

## 🔵 Low / UX Issues

---

### BUG-016 · `StatusBar` imported from both `react-native` and `expo-status-bar` across screens
**Files:** All screen files  
**Severity:** 🔵 Low  
**Type:** Inconsistency / potential conflict

**Description:**  
`app/_layout.tsx` renders `<StatusBar style="dark" />` from `expo-status-bar` globally. Individual screens then also import and render `<StatusBar barStyle="dark-content" />` from `react-native`. On Android, two `StatusBar` calls can conflict, causing flicker or incorrect status bar theming when navigating between screens.

**Fix:**  
Remove the per-screen `StatusBar` imports and rely solely on the global one in `_layout.tsx`. The `expo-status-bar` global wrapper is the correct approach with Expo Router.

---

### BUG-017 · `worker-dashboard.tsx` — dead `bottomBar` / `navItem` styles (unreferenced)
**File:** [`app/worker-dashboard.tsx`](app/worker-dashboard.tsx) L717–L754  
**Severity:** 🔵 Low  
**Type:** Dead code

**Description:**  
The stylesheet contains `bottomBar`, `navItem`, `navIconBox`, `navIconBoxActive`, `navLabel`, `navLabelActive` styles — a complete old bottom nav implementation — that are never referenced in the JSX (the shared `BottomNavBar` component is used instead). This adds ~40 lines of dead style code.

**Fix:**  
Delete lines 717–754 from the styles object.

---

### BUG-018 · `statsDate` in `worker-dashboard.tsx` is hardcoded to "Today, 1 Sep"
**File:** [`app/worker-dashboard.tsx`](app/worker-dashboard.tsx) L210  
**Severity:** 🔵 Low  
**Type:** Hardcoded placeholder

**Description:**  
The date label reads `"Today, 1 Sep"` regardless of the actual current date.

**Fix:**
```tsx
<Text style={styles.statsDate}>
  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
</Text>
```

---

### BUG-019 · Map coords are identical across all 3 screens — no per-booking customisation
**Files:** [`app/track-worker.tsx`](app/track-worker.tsx) L89–L92, [`app/job-details.tsx`](app/job-details.tsx) L180–L183, [`app/worker-profile.tsx`](app/worker-profile.tsx) L225–L228  
**Severity:** 🔵 Low  
**Type:** Hardcoded placeholder data

**Description:**  
All three Leaflet map instances use the exact same hardcoded coordinates:
- Worker: `23.7700, 90.3600`  
- Customer: `23.7639, 90.3589`

The map is non-interactive for real bookings; coords should come from props/state/route params.

---

### BUG-020 · Pros list in `index.tsx` has no "no results" empty state
**File:** [`app/index.tsx`](app/index.tsx) L408–L453  
**Severity:** 🔵 Low  
**Type:** Missing empty state

**Description:**  
When the user searches for something with no matches (e.g. `"mason"`) or filters by a category with no workers, `filteredPros` becomes an empty array and the list section renders nothing — no message, no illustration, no "clear filter" prompt within the list. The section header still says "Showing electricians" with nothing below it.

**Fix:**
```tsx
{filteredPros.length === 0 ? (
  <Text style={styles.emptyText}>No workers found. Try a different search.</Text>
) : filteredPros.map((pro) => (...))}
```

---

### BUG-021 · `PageQuickSwitcher` is a dev-only tool but has no conditional rendering guard
**File:** [`components/page-quick-switcher.tsx`](components/page-quick-switcher.tsx)  
**Severity:** 🔵 Low  
**Type:** Dev artifact leaking to production

**Description:**  
The `PageQuickSwitcher` floating button appears on every screen and is intended for development review only. It is included unconditionally — there's no `__DEV__` guard or environment check. This means it will appear in production builds.

**Fix:**
```tsx
// In page-quick-switcher.tsx or at each usage site:
if (!__DEV__) return null;
```

---

## 📋 Appendix — Files Checked

| File | Lines | Bugs Found |
|---|---|---|
| `app/_layout.tsx` | 13 | BUG-016 (partial) |
| `app/welcome.tsx` | 468 | BUG-001, BUG-015 |
| `app/index.tsx` | 1057 | BUG-005, BUG-007, BUG-009, BUG-014, BUG-020 |
| `app/worker-dashboard.tsx` | 756 | BUG-004, BUG-007, BUG-010, BUG-013, BUG-017, BUG-018 |
| `app/worker-profile.tsx` | 670 | BUG-002, BUG-003, BUG-007, BUG-008, BUG-011, BUG-019 |
| `app/job-details.tsx` | 610 | BUG-002, BUG-003, BUG-004, BUG-007, BUG-011, BUG-012, BUG-019 |
| `app/track-worker.tsx` | 504 | BUG-003, BUG-007, BUG-011, BUG-016, BUG-019 |
| `app/customer-dashboard.tsx` | ~2 | BUG-006 |
| `components/page-quick-switcher.tsx` | — | BUG-021 |

---

*Report generated by static code analysis. No runtime crashes were triggered during analysis — TypeScript and ESLint both pass clean.*
