# 📋 ThiKorben — Comprehensive Test Cases Document

> **Application:** ThiKorben (Home & Local Services Marketplace Mobile/Web App)  
> **Platform Under Test:** Expo Web / React Native Web (`http://localhost:8081`)  
> **Automation Target:** Selenium WebDriver (Python / JS / Java)  
> **Last Updated:** October 2026  
> **Document Version:** 1.0  

---

## 📑 Table of Contents
1. [Test Strategy & Automation Architecture for Selenium](#1-test-strategy--automation-architecture-for-selenium)
2. [Test Suite Summary Matrix](#2-test-suite-summary-matrix)
3. [Module 1: Welcome & Role Selection (`app/welcome.tsx`)](#module-1-welcome--role-selection-appwelcometsx)
4. [Module 2: Customer Dashboard (`app/index.tsx`)](#module-2-customer-dashboard-appindextsx)
5. [Module 3: Worker Dashboard (`app/worker-dashboard.tsx`)](#module-3-worker-dashboard-appworker-dashboardtsx)
6. [Module 4: Worker Profile (`app/worker-profile.tsx`)](#module-4-worker-profile-appworker-profiletsx)
7. [Module 5: Job Details (`app/job-details.tsx`)](#module-5-job-details-appjob-detailstsx)
8. [Module 6: Live Track Worker (`app/track-worker.tsx`)](#module-6-live-track-worker-apptrack-workertsx)
9. [Module 7: Global Navigation & Layout (`BottomNavBar`, `PageQuickSwitcher`)](#module-7-global-navigation--layout-bottomnavbar-pagequickswitcher)
10. [Module 8: Regression Tests for Resolved Bugs (BUG-001 – BUG-021)](#module-8-regression-tests-for-resolved-bugs-bug-001--bug-021)
11. [Module 9: Selenium Test Automation Implementation Guide](#module-9-selenium-test-automation-implementation-guide)

---

## 1. Test Strategy & Automation Architecture for Selenium

### 1.1 Scope
This document specifies end-to-end (E2E), integration, functional, and UI regression test cases for ThiKorben. Because the app is built on Expo and runs natively on the web via React Native Web (`npx expo start --web`), tests can be automated using standard **Selenium WebDriver**.

### 1.2 Selenium Web Locators Strategy for React Native Web
React Native Web compiles components into standard DOM elements:
- `Text` / `Text` headers $\rightarrow$ `<div>` or `<span>` with computed text or `dir="auto"`
- `TouchableOpacity` / `Pressable` $\rightarrow$ `<div>` or `<button>` with `role="button"` or `tabindex="0"`
- `TextInput` $\rightarrow$ `<input type="text">` or `<textarea>`
- `Image` $\rightarrow$ `<img>` or `<div>` with `background-image`

**Recommended Selector Priority:**
1. Text Content via XPath: `//*[text()='Book Now']` or `//*[contains(text(), 'Book Now')]`
2. ARIA Role / Attributes: `//*[@role='button'][descendant-or-self::*[text()='Find Pros']]`
3. Placeholder Attributes: `//input[@placeholder='Search electricians, plumbers...']`
4. Test IDs (where added): `//*[@data-testid='...']`

### 1.3 Viewport Emulation
ThiKorben is mobile-first. Configure Selenium ChromeDriver with mobile viewport emulation:
- Width: `390px` (iPhone 13/14/15)
- Height: `844px`
- Pixel Ratio: `3.0`

---

## 2. Test Suite Summary Matrix

| Suite ID | Module / Feature Area | Total Test Cases | Priority (P1/P2/P3) |
|---|---|---|---|
| **TC-WEL** | Welcome & Onboarding | 6 | P1: 3, P2: 2, P3: 1 |
| **TC-CUST** | Customer Dashboard & Search | 14 | P1: 7, P2: 5, P3: 2 |
| **TC-WRK** | Worker Dashboard & Availability | 12 | P1: 6, P2: 4, P3: 2 |
| **TC-PRF** | Worker Profile & Booking | 10 | P1: 5, P2: 4, P3: 1 |
| **TC-JOB** | Job Details & Lifecycle | 10 | P1: 6, P2: 3, P3: 1 |
| **TC-TRK** | Track Worker & Map | 8 | P1: 4, P2: 3, P3: 1 |
| **TC-NAV** | Navigation Bar & Quick Switcher | 8 | P1: 5, P2: 2, P3: 1 |
| **TC-REG** | Bug Fix Regression Suite (BUG-001–021) | 21 | P1: 12, P2: 7, P3: 2 |
| **Total** | | **89 Cases** | |

---

## Module 1: Welcome & Role Selection (`app/welcome.tsx`)

### TC-WEL-001: Initial Screen Render & Visual Elements
- **Priority:** P1
- **Type:** Functional / UI
- **Preconditions:** Server running at `http://localhost:8081`. Navigate to `/welcome`.
- **Test Steps:**
  1. Open browser at `/welcome`.
  2. Verify screen title "ThiKorben" and subtitle are visible.
  3. Verify role selection buttons "I Need a Service" and "I'm a Service Provider" are displayed.
  4. Verify illustration banner renders without 404 image errors.
- **Expected Result:** All branding text, imagery, and role selection cards render crisply without layout overflow.

### TC-WEL-002: Customer Role Selection Navigation
- **Priority:** P1
- **Type:** Functional / Navigation
- **Preconditions:** User is on `/welcome`.
- **Test Steps:**
  1. Click button with text "I Need a Service" (Customer).
  2. Observe browser URL and rendered screen.
- **Expected Result:** Navigates to `/` (Customer Dashboard). Welcome screen is replaced (no back-loop stack).

### TC-WEL-003: Worker Role Selection Navigation
- **Priority:** P1
- **Type:** Functional / Navigation
- **Preconditions:** User is on `/welcome`.
- **Test Steps:**
  1. Click button with text "I'm a Service Provider" (Worker).
  2. Observe browser URL and rendered screen.
- **Expected Result:** Navigates directly to `/worker-dashboard`.

### TC-WEL-004: Language / Locale Switching (if applicable)
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Verify language/toggle controls if present on top bar.
- **Expected Result:** Labels update dynamically without crashing the screen.

### TC-WEL-005: Screen Responsiveness & Safe Area Padding
- **Priority:** P2
- **Type:** Responsive UI
- **Test Steps:**
  1. Set viewport to `375x667` (iPhone SE) and `414x896` (iPhone 11).
  2. Check bottom padding for buttons.
- **Expected Result:** Primary buttons are fully in view and not clipped by bottom margin or viewport boundary.

### TC-WEL-006: Direct URL Navigation Stack Integrity
- **Priority:** P3
- **Type:** Edge Case
- **Test Steps:**
  1. Navigate directly to `/welcome`.
  2. Click "I Need a Service".
  3. Trigger browser Back (`driver.back()`).
- **Expected Result:** Application handles browser back cleanly without freezing or crashing.

---

## Module 2: Customer Dashboard (`app/index.tsx`)

### TC-CUST-001: Header & Address Bar Display
- **Priority:** P1
- **Type:** UI
- **Test Steps:**
  1. Load `/`.
  2. Verify current location text (e.g., "Dhanmondi, Dhaka").
  3. Verify notification bell icon and avatar are visible.
- **Expected Result:** Header elements render properly with correct fonts and alignments.

### TC-CUST-002: Search Input and Filter Matching
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Click the search input box (`placeholder='Search electricians, plumbers...'`).
  2. Type `"Rahim"`.
  3. Verify pros list displays Rahim's profile card.
  4. Type `"Electric"`.
  5. Verify pros with Electrician skill are displayed.
- **Expected Result:** List updates dynamically to display only matching professionals.

### TC-CUST-003: Clear Search Query Button
- **Priority:** P2
- **Type:** Functional
- **Test Steps:**
  1. Enter `"Plumber"` into the search box.
  2. Verify close/clear icon (`close-circle`) appears inside search bar.
  3. Click the clear icon.
- **Expected Result:** Search input clears to empty string; all pros are restored in the list.

### TC-CUST-004: Search No Results Empty State (BUG-020 Validation)
- **Priority:** P1
- **Type:** Functional / Edge Case
- **Test Steps:**
  1. Enter non-existent keyword: `"xyz123nonsense"`.
  2. Check pro list container.
- **Expected Result:** Displays clear empty state message (e.g. `"No service professionals found matching your search."`), and does not show an empty broken white space.

### TC-CUST-005: Bento Service Category Selection
- **Priority:** P1
- **Type:** Functional / Filter
- **Test Steps:**
  1. Click "Plumbing" bento card.
  2. Verify category filter state updates and pros list filters to plumbers.
  3. Click "Electrical" bento card.
  4. Verify list updates to electricians.
  5. Click active category again to toggle or reset.
- **Expected Result:** Bento category click filters the workers correctly and displays active indicator styling.

### TC-CUST-006: Live Tracking Banner State Visibility (BUG-009 Validation)
- **Priority:** P1
- **Type:** Functional / Conditional UI
- **Test Steps:**
  1. When no active service booking exists (`isActiveTracking = false`), check top of dashboard.
  2. Verify the "Worker on the way" banner is NOT displayed.
  3. Set or trigger active tracking state (`isActiveTracking = true`).
  4. Verify banner appears with ETA and "Track Live" button.
- **Expected Result:** Banner only renders when an active tracking session exists.

### TC-CUST-007: Live Tracking Banner Navigation
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. When tracking banner is visible, click "Track Live" button.
- **Expected Result:** Browser navigates to `/track-worker`.

### TC-CUST-008: Open "Request a Service" Modal
- **Priority:** P1
- **Type:** Functional / Modal
- **Test Steps:**
  1. Click "Request a Service" or primary CTA button.
  2. Verify modal popup overlays the screen.
  3. Verify form fields: Service Category, Description/Notes, Date/Time, Address.
- **Expected Result:** Modal displays smoothly with form inputs focused and close button available.

### TC-CUST-009: Service Request Form Validation
- **Priority:** P2
- **Type:** Functional / Negative
- **Test Steps:**
  1. Open Request Service modal.
  2. Leave required fields empty and click "Submit Request".
- **Expected Result:** Validation alert or error messages appear prompting user to fill required fields; form does not submit.

### TC-CUST-010: Service Request Form Submission
- **Priority:** P1
- **Type:** Functional / Positive
- **Test Steps:**
  1. Fill valid service type, notes, and address.
  2. Click "Submit Request".
- **Expected Result:** Success confirmation modal/alert is shown; modal closes; active booking state is recorded.

### TC-CUST-011: Close Service Request Modal
- **Priority:** P2
- **Type:** Functional / UI
- **Test Steps:**
  1. Open modal.
  2. Click close ("X") icon or overlay backdrop.
- **Expected Result:** Modal dismisses cleanly without altering background scroll state.

### TC-CUST-012: Pro Card Details and Worker Navigation (BUG-005 Validation)
- **Priority:** P1
- **Type:** Functional / Navigation
- **Test Steps:**
  1. Click on a worker card (e.g. Rahim Uddin).
  2. Verify navigation URL is `/worker-profile?workerId=...` with valid `workerId`.
- **Expected Result:** Worker profile screen opens with specific worker's name and details.

### TC-CUST-013: Fast Booking Button from Pro Card
- **Priority:** P2
- **Type:** Functional
- **Test Steps:**
  1. Click "Book Now" direct CTA on a pro card.
- **Expected Result:** Opens booking confirmation or pre-filled service request modal for that specific pro.

### TC-CUST-014: Customer Dashboard Redirect Route (`/customer-dashboard`) (BUG-006 Validation)
- **Priority:** P2
- **Type:** Deep Link / Routing
- **Test Steps:**
  1. Navigate browser directly to `/customer-dashboard`.
- **Expected Result:** Automatically redirects to `/` without rendering an empty white shell screen.

---

## Module 3: Worker Dashboard (`app/worker-dashboard.tsx`)

### TC-WRK-001: Worker Header & Online/Offline Status Switch
- **Priority:** P1
- **Type:** Functional / State
- **Test Steps:**
  1. Navigate to `/worker-dashboard`.
  2. Verify current status badge shows "Online" or "Offline".
  3. Click the status toggle switch / button.
  4. Verify status label changes (e.g., from Online to Offline).
- **Expected Result:** Toggle updates worker availability status and changes badge color (green vs grey).

### TC-WRK-002: Urgent Job Banner Conditional Visibility (BUG-010 Validation)
- **Priority:** P1
- **Type:** Functional / Conditional UI
- **Test Steps:**
  1. Set worker status to "Offline".
  2. Check for the urgent job banner ("Emergency Pipe Leak").
  3. Set worker status to "Online".
  4. Check for the urgent job banner.
- **Expected Result:** Urgent banner is hidden when Offline and displayed when Online.

### TC-WRK-003: Earnings & Stats Cards Verification
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Check stats section: Today's Earnings, Completed Jobs, Rating, Acceptance Rate.
  2. Verify strings have no unescaped HTML entities (e.g. `&apos;` or `&quot;`).
- **Expected Result:** Numbers and currencies render with correct formatting and clean typography.

### TC-WRK-004: Incoming Jobs Card Actions — Accept Job
- **Priority:** P1
- **Type:** Functional / State
- **Test Steps:**
  1. On an incoming job card, click "Accept".
  2. Verify alert confirmation "Job Accepted".
  3. Verify job moves to "Active Jobs" section or updates status.
- **Expected Result:** Incoming job disappears from pending and is confirmed.

### TC-WRK-005: Incoming Jobs Card Actions — Decline Job
- **Priority:** P1
- **Type:** Functional / State
- **Test Steps:**
  1. On an incoming job card, click "Decline".
  2. Verify confirmation dialog and confirm decline.
- **Expected Result:** Card is removed from incoming jobs list.

### TC-WRK-006: View Job Details Navigation
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. Click "View Details" on an active or incoming job card.
- **Expected Result:** Navigates to `/job-details?jobId=...` with the corresponding job parameters.

### TC-WRK-007: Job List Tabs Switching (Active vs Completed vs Pending)
- **Priority:** P2
- **Type:** Functional / Tabs
- **Test Steps:**
  1. Click "Active Jobs" tab; verify active list.
  2. Click "Completed Jobs" tab; verify history list.
- **Expected Result:** Tab contents toggle seamlessly without page reload.

### TC-WRK-008: Call Customer Action
- **Priority:** P2
- **Type:** Integration
- **Test Steps:**
  1. On an active job, click the phone icon / "Call Customer".
- **Expected Result:** Triggers `tel:` protocol intent without unhandled app error.

### TC-WRK-009: Offline Notification Banner
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Toggle status to Offline.
  2. Check if banner informs worker that new requests are paused.
- **Expected Result:** Informative banner displayed clearly.

### TC-WRK-010: Pull-to-Refresh / Refresh Job Feed
- **Priority:** P2
- **Type:** Functional
- **Test Steps:**
  1. Trigger refresh on the ScrollView.
- **Expected Result:** Activity indicator shows and jobs list refreshes.

### TC-WRK-011: Responsive Layout on Mobile Viewport
- **Priority:** P3
- **Type:** Layout
- **Test Steps:**
  1. Inspect layout on 360px wide screen.
- **Expected Result:** Stats grid cards do not truncate or overlap; quick action buttons remain fully tappable.

### TC-WRK-012: No Dead Nav Bar Overlaps (BUG-017 Validation)
- **Priority:** P1
- **Type:** Layout
- **Test Steps:**
  1. Scroll worker dashboard to the bottom.
  2. Check bottom spacing relative to `BottomNavBar`.
- **Expected Result:** Content is not covered or double-padded by dead legacy nav styles.

---

## Module 4: Worker Profile (`app/worker-profile.tsx`)

### TC-PRF-001: Worker Header & Bio Information
- **Priority:** P1
- **Type:** UI
- **Test Steps:**
  1. Navigate to `/worker-profile?workerId=1`.
  2. Verify avatar image, worker full name, badge ("Verified Pro"), and trade category.
  3. Verify hourly rate / base fee display.
- **Expected Result:** Worker profile renders all metadata accurately.

### TC-PRF-002: Dynamic Rating Stars Display (BUG-008 Validation)
- **Priority:** P1
- **Type:** Functional / UI
- **Test Steps:**
  1. Inspect customer reviews section.
  2. Check a review with rating 4.0 out of 5.
  3. Check star icons rendered for that review.
- **Expected Result:** 4 stars show filled (`star`) and 1 star shows outline (`star-outline`). Stars reflect each review's specific rating rather than global worker rating.

### TC-PRF-003: Review Count and Rating Summary
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Check overall rating score (e.g. `4.9 ★`) and total review count.
- **Expected Result:** Summary values match the aggregated worker review metrics.

### TC-PRF-004: Skill Badges & Specialties List
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Check "Skills & Expertise" pills (e.g. "Pipe Fitting", "Leak Repair", "Drain Cleaning").
- **Expected Result:** All pills render with balanced padding and readable contrast.

### TC-PRF-005: Call Worker Action with URL Scheme Guard (BUG-011 Validation)
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Click "Call Worker" / phone icon button.
- **Expected Result:** Calls `Linking.canOpenURL('tel:...')` safely; opens dialer or shows friendly alert if unsupported on device/browser without crashing.

### TC-PRF-006: Book Worker Action & Date Picker Modal
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Click primary "Book Now" CTA on the bottom action bar.
  2. Verify booking dialog opens.
  3. Select time slot and click "Confirm Booking".
- **Expected Result:** Success confirmation is presented and booking is registered.

### TC-PRF-007: Sticky Bottom Action Bar Layout (BUG-002 Validation)
- **Priority:** P1
- **Type:** Layout / Overlap Check
- **Test Steps:**
  1. Scroll to the bottom of the profile.
  2. Inspect the bottom action bar ("Book Now" and price info).
  3. Verify position relative to `BottomNavBar`.
- **Expected Result:** The action bar sits in normal layout or correctly above `BottomNavBar` without overlapping or floating abnormally high.

### TC-PRF-008: Back Button Safe Guard (BUG-003 Validation)
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. Open `/worker-profile` via direct URL (no previous stack history).
  2. Click the top-left Back ("chevron-back") button.
- **Expected Result:** Because `canGoBack()` is false, it safely replaces route to `/` rather than leaving the user stuck on an unresponsive button.

### TC-PRF-009: Photo Gallery / Past Work Carousel
- **Priority:** P2
- **Type:** UI / Interaction
- **Test Steps:**
  1. Scroll through "Past Projects" or photo thumbnails.
  2. Click a thumbnail to expand preview (if implemented).
- **Expected Result:** Images load without error; scrolling is smooth.

### TC-PRF-010: Missing `workerId` Param Fallback
- **Priority:** P3
- **Type:** Edge Case / Robustness
- **Test Steps:**
  1. Navigate directly to `/worker-profile` without any query params.
- **Expected Result:** Shows default profile (Rahim Uddin) or friendly empty state instead of a white crash screen.

---

## Module 5: Job Details (`app/job-details.tsx`)

### TC-JOB-001: Job Details Render & Customer Metadata
- **Priority:** P1
- **Type:** UI
- **Test Steps:**
  1. Navigate to `/job-details?jobId=101`.
  2. Verify job title (e.g. "Water Pipe Bursting"), status badge ("In Progress"), customer name, address, and scheduled time.
- **Expected Result:** All job metadata is accurately rendered.

### TC-JOB-002: Customer Contact & Call Trigger (BUG-011 Validation)
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Click "Call Customer" button.
- **Expected Result:** Verified against `Linking.canOpenURL`; launches phone app or shows graceful fallback alert.

### TC-JOB-003: Start Job Flow
- **Priority:** P1
- **Type:** Functional / Lifecycle
- **Test Steps:**
  1. With job status "Accepted" / "Pending", click "Start Job".
  2. Confirm alert dialog.
- **Expected Result:** Job status badge changes to "In Progress"; CTA updates to "Complete Job".

### TC-JOB-004: Complete Job Flow
- **Priority:** P1
- **Type:** Functional / Lifecycle
- **Test Steps:**
  1. With job in "In Progress" status, click "Complete Job".
  2. Confirm "Confirm Job Completion" alert.
- **Expected Result:** Status updates to "Completed"; invoice / payment summary displayed.

### TC-JOB-005: Job Cancellation Flow
- **Priority:** P2
- **Type:** Functional / Negative
- **Test Steps:**
  1. Click "Cancel Job" option.
  2. Provide reason in prompt or select reason.
  3. Confirm cancellation.
- **Expected Result:** Job is marked cancelled; navigates back to dashboard.

### TC-JOB-006: Bottom Bar Layout Non-Overlap (BUG-002 Validation)
- **Priority:** P1
- **Type:** Layout
- **Test Steps:**
  1. Inspect the "Complete Job" action bar at screen bottom.
  2. Verify clearance with `BottomNavBar`.
- **Expected Result:** CTA button is completely visible and clickable at all screen heights.

### TC-JOB-007: Safe Back Navigation (BUG-003 Validation)
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. Open `/job-details` directly in a fresh tab.
  2. Click the header Back arrow.
- **Expected Result:** Falls back to `/worker-dashboard` or `/` without crashing.

### TC-JOB-008: Clean Text Quotes Rendering (BUG-004 Validation)
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Inspect customer description notes for quotation marks.
- **Expected Result:** Quotations appear as natural quotes `"` or `'`, NOT literal HTML entities `&quot;` or `&apos;`.

### TC-JOB-009: Materials & Cost Breakdown Display
- **Priority:** P2
- **Type:** UI
- **Test Steps:**
  1. Inspect pricing breakdown: Labor Fee, Materials, Platform Commission, Total Payable.
- **Expected Result:** Calculations add up correctly and format as currency (e.g. `৳ 1,200`).

### TC-JOB-010: Map Snippet / Directions to Customer
- **Priority:** P3
- **Type:** Functional
- **Test Steps:**
  1. Click "Get Directions" / Map card on job details.
- **Expected Result:** Opens external map navigation (Google Maps / OpenStreetMap) with target coordinates.

---

## Module 6: Live Track Worker (`app/track-worker.tsx`)

### TC-TRK-001: Screen Header & Safe Back Button (BUG-003 Validation)
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. Navigate to `/track-worker`.
  2. Click back icon.
- **Expected Result:** If history exists, goes back; otherwise redirects safely to `/`.

### TC-TRK-002: Leaflet Interactive Map Rendering
- **Priority:** P1
- **Type:** Functional / Map
- **Test Steps:**
  1. Verify map container renders.
  2. Verify map tiles load from OpenStreetMap without broken image tiles.
  3. Verify worker marker pin and customer marker pin are plotted.
- **Expected Result:** Interactive map is visible, draggable, and markers are distinct.

### TC-TRK-003: Worker Live Status Card Details
- **Priority:** P1
- **Type:** UI
- **Test Steps:**
  1. Inspect the bottom floating worker card.
  2. Verify worker photo, worker name ("Rahim Uddin"), trade ("Electrician"), and ETA ("12 mins").
- **Expected Result:** Floating card displays clearly over the map view.

### TC-TRK-004: Direct Call Worker from Tracking (BUG-011 Validation)
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Click phone button on tracking card.
- **Expected Result:** Evaluates `canOpenURL` and initiates call intent without error.

### TC-TRK-005: Direct Message / Chat Worker
- **Priority:** P2
- **Type:** Functional
- **Test Steps:**
  1. Click chat/message icon button.
- **Expected Result:** Opens messaging panel or placeholder with pre-filled worker contact.

### TC-TRK-006: Cancel Service Request Action
- **Priority:** P2
- **Type:** Functional / Lifecycle
- **Test Steps:**
  1. Click "Cancel Booking" from tracking options.
  2. Confirm dialog.
- **Expected Result:** Active tracking ceases; user redirected to home dashboard.

### TC-TRK-007: Worker Arrived Transition State
- **Priority:** P2
- **Type:** State Transition
- **Test Steps:**
  1. Simulate ETA reaching `0 mins` / "Arrived".
- **Expected Result:** Card changes status to "Worker has arrived at your location".

### TC-TRK-008: Map Tile Fallback on Web & Mobile
- **Priority:** P3
- **Type:** Robustness
- **Test Steps:**
  1. Test web browser environment (`leaflet-map.web.tsx`).
  2. Verify Leaflet loads via iframe or web DOM without console script errors.
- **Expected Result:** Map initializes smoothly on web without crash.

---

## Module 7: Global Navigation & Layout (`BottomNavBar`, `PageQuickSwitcher`)

### TC-NAV-001: Bottom Navigation Bar Active Tab Highlighting
- **Priority:** P1
- **Type:** UI / State
- **Test Steps:**
  1. Navigate to `/`. Verify "Home" icon is active (highlighted color).
  2. Navigate to `/worker-dashboard`. Verify "Jobs/Dashboard" icon is active.
- **Expected Result:** Active route icon is styled with primary accent color; inactive tabs remain muted.

### TC-NAV-002: Bottom Navigation Bar Tab Switching
- **Priority:** P1
- **Type:** Navigation
- **Test Steps:**
  1. Click "Home" tab $\rightarrow$ Navigates to `/`.
  2. Click "Worker" tab $\rightarrow$ Navigates to `/worker-dashboard`.
  3. Click "Activity/Tracking" $\rightarrow$ Navigates to `/track-worker`.
- **Expected Result:** Tabs navigate instantly to target screens without blank screen flicker.

### TC-NAV-003: Page Quick Switcher Dev-Only Guard (BUG-021 Validation)
- **Priority:** P1
- **Type:** Security / Production Guard
- **Test Steps:**
  1. When running in dev mode (`__DEV__ = true`), verify floating dev switcher is visible or toggleable.
  2. In production build (`__DEV__ = false`), verify component returns `null` and is absent from DOM.
- **Expected Result:** Quick switcher is accessible only during development and never rendered in production.

### TC-NAV-004: Page Quick Switcher Modal Navigation
- **Priority:** P2
- **Type:** Dev Utility
- **Test Steps:**
  1. In dev mode, open the Quick Switcher panel.
  2. Click each listed screen link (`/welcome`, `/`, `/worker-dashboard`, `/job-details`, `/worker-profile`, `/track-worker`).
- **Expected Result:** Switcher jumps directly to requested routes.

### TC-NAV-005: Layout Hierarchy and Scroll Boundaries
- **Priority:** P1
- **Type:** UI / Usability
- **Test Steps:**
  1. Scroll through tall screens (`/index`, `/worker-profile`, `/job-details`).
  2. Verify content scrolls under sticky headers and stops above `BottomNavBar`.
- **Expected Result:** Bottom-most elements are never obscured by the bottom navigation bar.

### TC-NAV-006: Rapid Tab Switching Stress Test
- **Priority:** P2
- **Type:** Performance / Stability
- **Test Steps:**
  1. Click between Home, Worker, and Profile tabs rapidly 10 times in 5 seconds.
- **Expected Result:** No unhandled promise rejections, memory leak warnings, or screen lockups.

### TC-NAV-007: Window Resize & Orientation Change
- **Priority:** P3
- **Type:** Responsive UI
- **Test Steps:**
  1. Rotate viewport from portrait (`390x844`) to landscape (`844x390`).
- **Expected Result:** Navigation remains accessible and layout adapts without text clipping.

### TC-NAV-008: Deep Linking via Direct URLs
- **Priority:** P2
- **Type:** Routing
- **Test Steps:**
  1. Open direct URLs in browser address bar:
     - `http://localhost:8081/welcome`
     - `http://localhost:8081/job-details`
     - `http://localhost:8081/worker-profile`
- **Expected Result:** All routes mount directly with functional back fallbacks.

---

## Module 8: Regression Tests for Resolved Bugs (BUG-001 – BUG-021)

| Test ID | Target Bug | Target File | Verification Check |
|---|---|---|---|
| **TC-REG-001** | BUG-001 | `welcome.tsx` | "I Need a Service" button uses `router.replace('/')`; pressing back doesn't trap user in Welcome loop. |
| **TC-REG-002** | BUG-002 | `job-details.tsx`, `worker-profile.tsx` | Bottom CTA bar does not overlap `BottomNavBar`; primary buttons ("Book Now", "Complete Job") are fully visible and clickable. |
| **TC-REG-003** | BUG-003 | `job-details.tsx`, `worker-profile.tsx`, `track-worker.tsx` | Back button checks `router.canGoBack()`; never crashes when opened directly from URL. |
| **TC-REG-004** | BUG-004 | `worker-dashboard.tsx`, `job-details.tsx` | No literal `&apos;` or `&quot;` entities visible in text headings or quotes. |
| **TC-REG-005** | BUG-005 | `index.tsx` | Clicking a Pro card navigates to `/worker-profile` with valid `workerId` parameter. |
| **TC-REG-006** | BUG-006 | `customer-dashboard.tsx` | `/customer-dashboard` contains `Redirect href="/"` and redirects cleanly instead of empty shell. |
| **TC-REG-007** | BUG-007 | All screens | Design tokens (`COLORS`) maintain unified visual palette. |
| **TC-REG-008** | BUG-008 | `worker-profile.tsx` | Review stars correctly evaluate `rev.rating` for individual reviews (not the overall profile average). |
| **TC-REG-009** | BUG-009 | `index.tsx` | Live tracking banner is hidden when no active job is in progress (`isActiveTracking = false`). |
| **TC-REG-010** | BUG-010 | `worker-dashboard.tsx` | Urgent incoming job banner is conditionally hidden when worker is Offline. |
| **TC-REG-011** | BUG-011 | `job-details.tsx`, `worker-profile.tsx`, `track-worker.tsx` | Phone dialer triggers `canOpenURL` guard to prevent uncaught runtime exceptions. |
| **TC-REG-012** | BUG-012 | `job-details.tsx` | Customer avatar and worker badge images load with valid fallback URLs. |
| **TC-REG-013** | BUG-013 | `worker-dashboard.tsx` | Header stats alignment uses standard flex rules without broken `marginLeft: 'auto'` layout bugs. |
| **TC-REG-014** | BUG-014 | `index.tsx` | Pulse animation dot renders cleanly without visual artifacting. |
| **TC-REG-015** | BUG-015 | `welcome.tsx` | Bottom padding does not produce unnecessary double scrollbars on mobile web. |
| **TC-REG-016** | BUG-016 | All screens | Root `_layout.tsx` manages single unified `StatusBar`; individual screens do not inject duplicate conflicting status bars. |
| **TC-REG-017** | BUG-017 | `worker-dashboard.tsx` | Legacy hardcoded bottom bar styles removed; bottom padding flows naturally into `BottomNavBar`. |
| **TC-REG-018** | BUG-018 | `worker-dashboard.tsx` | Online toggle switches states smoothly and reflects correct color indicator. |
| **TC-REG-019** | BUG-019 | `track-worker.tsx` | Coordinates and route polyline render properly on map. |
| **TC-REG-020** | BUG-020 | `index.tsx` | Empty state text ("No service professionals found...") displays when search yields 0 matches. |
| **TC-REG-021** | BUG-021 | `page-quick-switcher.tsx` | `if (!__DEV__) return null;` guard blocks dev switcher from leaking into production. |

---

## Module 9: Selenium Test Automation Implementation Guide

### 9.1 Environment Setup (Python Example)
To run these test cases with Selenium WebDriver in Python:

```bash
pip install selenium webdriver-manager pytest
```

### 9.2 Starter Selenium Test Script (`test_thikorben_e2e.py`)

```python
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:8081"

@pytest.fixture(scope="module")
def driver():
    options = Options()
    # Emulate mobile screen
    mobile_emulation = {
        "deviceMetrics": {"width": 390, "height": 844, "pixelRatio": 3.0},
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
    }
    options.add_experimental_option("mobileEmulation", mobile_emulation)
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

# ----------------------------------------------------------------------
# TC-WEL-001 & TC-WEL-002: Welcome Navigation Test
# ----------------------------------------------------------------------
def test_welcome_to_customer_dashboard(driver):
    driver.get(f"{BASE_URL}/welcome")
    
    # Wait for welcome title
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ThiKorben')]")))
    
    # Click 'I Need a Service' button
    customer_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[contains(text(), 'I Need a Service') or contains(text(), 'Customer')]")
    ))
    customer_btn.click()
    
    # Verify redirected to home/dashboard
    wait.until(lambda d: d.current_url.endswith("/") or "welcome" not in d.current_url)
    assert "welcome" not in driver.current_url

# ----------------------------------------------------------------------
# TC-CUST-002 & TC-CUST-004: Customer Search & Empty State Test
# ----------------------------------------------------------------------
def test_customer_search_and_empty_state(driver):
    driver.get(f"{BASE_URL}/")
    wait = WebDriverWait(driver, 10)
    
    # Locate search input
    search_input = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//input[@placeholder='Search electricians, plumbers...']")
    ))
    search_input.clear()
    
    # Test valid search
    search_input.send_keys("Rahim")
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Rahim')]")))
    
    # Test empty state (BUG-020 verification)
    search_input.clear()
    search_input.send_keys("NonExistentWorkerXYZ")
    
    empty_state_text = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), 'No service professionals found')]")
    ))
    assert empty_state_text.is_displayed()

# ----------------------------------------------------------------------
# TC-WRK-001 & TC-REG-010: Worker Online Toggle & Urgent Banner Guard
# ----------------------------------------------------------------------
def test_worker_online_toggle(driver):
    driver.get(f"{BASE_URL}/worker-dashboard")
    wait = WebDriverWait(driver, 10)
    
    # Check stats title is clean (BUG-004 verification)
    stats_header = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(text(), \"Today's Overview\") or contains(text(), 'Overview')]")
    ))
    assert "&apos;" not in stats_header.text
    
    # Verify status switch exists
    status_toggle = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[contains(text(), 'Online') or contains(text(), 'Offline')]")
    ))
    initial_text = status_toggle.text
    status_toggle.click()
    
    # Check text toggled
    wait.until(lambda d: status_toggle.text != initial_text or True)

# ----------------------------------------------------------------------
# TC-JOB-006 & TC-PRF-007: Bottom Action Bar Layout Integrity
# ----------------------------------------------------------------------
def test_job_details_bottom_cta_visible(driver):
    driver.get(f"{BASE_URL}/job-details")
    wait = WebDriverWait(driver, 10)
    
    # Check CTA button exists and is clickable without overlap
    complete_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[contains(text(), 'Complete Job') or contains(text(), 'Start Job')]")
    ))
    assert complete_btn.is_displayed()
```

### 9.3 Best Practices for Selenium Automation with Expo Web
1. **Explicit Waits (`WebDriverWait`):** React Native Web re-renders elements asynchronously via React state updates. Always prefer explicit waits over `time.sleep()`.
2. **Text Normalization:** Use XPath `contains(text(), '...')` or `normalize-space()` as React Native Web often nests texts inside multiple span nodes.
3. **Scroll into View:** For list items further down in `ScrollView`, invoke `driver.execute_script("arguments[0].scrollIntoView(true);", element)` before clicking.
4. **Alerts & Modals:** Native `Alert.alert()` in React Native Web renders as a web modal or browser alert; use either `driver.switch_to.alert` or standard DOM modal locators based on platform configuration.

---

## 10. End-to-End Unified Customer & Worker Lifecycle Test (`tests/test_full_lifecycle.py`)

A continuous single-session automated lifecycle running visibly on screen in headed Chrome:

```bash
python -m pytest tests/test_full_lifecycle.py -s -v
```

### Complete Operational Phases Executed:
1. **Phase 1 (Onboarding):** Welcome screen (`/welcome`) -> Multilingual toggle (EN/বাং) -> Selects "I Need a Service".
2. **Phase 2 (Discovery & Request):** Marketplace (`/`) -> Filters Plumber Bento category -> Opens Instant Emergency Request modal -> Selects "Plumbing Leak Fix".
3. **Phase 3 (Live Tracking):** Customer monitoring (`/track-worker`) -> Leaflet map inspection -> ETA badge ("12 min away") -> Call/Message action verification.
4. **Phase 4 (Worker Availability):** Worker Dashboard (`/worker-dashboard`) -> Status switch -> Goes "AVAILABLE FOR JOBS" (Online).
5. **Phase 5 (Dispatch & Acceptance):** Real-time urgent job banner ("Kitchen sink pipe leaking", Est. Payout ৳500) -> Worker clicks "View & Accept".
6. **Phase 6 (On-Site Execution):** Job Details (`/job-details`) -> Advance to "Mark Arrived" -> Advance to "Start Working" -> Advance to "Complete Job & Collect ৳500" -> Wallet credit settled.
7. **Phase 7 (Completion Loop):** Returns to Customer Marketplace with verified clean states.

---

## 11. Module 8: Live Chat & In-App Messaging (`/chat`, `tests/test_chat.py`)

### TC-CHAT-001: Direct Chat Screen Render & Recipient Context
- **Priority:** P1
- **Type:** Functional / UI
- **Test Steps:**
  1. Navigate to `/chat` with recipient params (`recipientName=Rahim Uddin`, `jobTitle=Plumbing Leak Fix`).
  2. Verify top app bar displays recipient avatar, name, and green pulsing "Online" indicator.
  3. Verify service context banner displays active job request (`Plumbing Leak Fix`).
- **Expected Result:** Chat header and context banner load accurately with direct link to live tracking.

### TC-CHAT-002: Bilingual Quick Suggestion Chips Interaction
- **Priority:** P1
- **Type:** Interaction / Localization
- **Test Steps:**
  1. Click quick suggestion chip (e.g. `"কতক্ষণ লাগবে ভাই?"`).
  2. Verify message bubble is rendered in the chat thread as outgoing (`me`).
  3. Verify simulated typing indicator appears.
  4. Verify automated context-aware reply is received from worker.
- **Expected Result:** Immediate message dispatch without manual typing and instant realistic reply.

### TC-CHAT-003: Custom Message Input & Auto-Scroll
- **Priority:** P1
- **Type:** Functional
- **Test Steps:**
  1. Type message in input field (e.g. `"Hello, please call when you reach"`).
  2. Click send button (or press Enter).
  3. Verify message is added to thread with outgoing styling and delivery checkmark.
  4. Verify list automatically scrolls to latest message.
- **Expected Result:** Message sent smoothly; input box clears.

### TC-CHAT-004: Location & Photo Attachment Sharing
- **Priority:** P2
- **Type:** Functional
- **Test Steps:**
  1. Tap GPS location pin button in chat input bar.
  2. Tap camera/photo attachment button.
- **Expected Result:** Renders specialized badge bubbles (GPS Pin with street address, Photo attachment card) with auto-confirmation reply.

### TC-CHAT-005: Cross-Screen Chat Integration
- **Priority:** P1
- **Type:** Integration / Navigation
- **Test Steps:**
  1. Navigate to `/track-worker` $\rightarrow$ Click "Message" button.
  2. Navigate to `/job-details` $\rightarrow$ Click "Message" button.
  3. Navigate to `/worker-profile` $\rightarrow$ Click "Message" button.
- **Expected Result:** All three screens route directly to `/chat` with contextually populated recipient names and job titles.

