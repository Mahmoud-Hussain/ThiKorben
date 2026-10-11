# Detailed Change Log & Implementation Manifest

**Repository:** `Mahmoud-Hussain/ThiKorben`  
**Pull Request (Fork):** [#1 (feature/live-chat-and-ux-bugfixes -> dev)](https://github.com/rajee99/ThiKorben-1/pull/1)  
**Upstream Compare:** [compare/dev...rajee99:ThiKorben-1:feature/live-chat-and-ux-bugfixes](https://github.com/Mahmoud-Hussain/ThiKorben/compare/dev...rajee99:ThiKorben-1:feature/live-chat-and-ux-bugfixes?expand=1)  
**Author:** rajee99  
**Status:** All checks passing (0 TypeScript errors, 0 ESLint warnings, 18/18 Pytest tests passing)

---

## 1. Executive Summary

This pull request introduces three major deliverables to the ThiKorben codebase:
1. **Full In-App Live Chat & Messaging System (`/chat`):** A dedicated, bilingual, interactive messaging interface connecting customers and service professionals with quick suggestions, attachment cards (GPS & photos), phone calling, and realistic automated response simulation.
2. **React Native Web Navigation & UX Bug Fixes:** Resolution of critical Web dialog traps where `Alert.alert` dropped navigation callbacks on browser environments (such as selecting emergency services from the home screen), fixing 22 documented bugs across routing, Leaflet maps, and layout.
3. **Automated Selenium & Pytest End-to-End Test Suite:** A complete, modular automation suite covering the full customer and worker lifecycle, live tracking, chat flows, dashboard transitions, and role switches in a headed mobile-emulated browser.
4. **Expo SDK 57 & React 19 CI Modernization:** Clean alignment of package versions, removal of deprecated `app.json` keys, and adaptation of handlers to meet strict React Compiler purity rules.

---

## 2. File-by-File Detailed Change Manifest

### A. Core Application & Screens (`app/`)

#### 1. `app/chat.tsx` *(New File — 787 lines)*
* **Purpose:** Provides a dedicated, responsive, real-time in-app chat thread between customers and service providers.
* **Key Capabilities:**
  * **Dynamic Recipient Header:** Accepts URL/query parameters (`recipientName`, `recipientRole`, `jobTitle`, `userRole`) with fallback to active booking context. Displays recipient avatar and a pulsing green "Online" badge.
  * **Service Context Banner:** Displays active job context (e.g. `Plumbing Leak Fix (Dhanmondi 27)`) with a one-click badge to navigate back to `/track-worker`.
  * **Interactive Message Thread:** Distinguishes incoming vs. outgoing messages with bubble styling, delivery timestamps, and double-check read receipts (`✓✓`).
  * **Rich Attachment Types:**
    * 📍 **GPS Pin Location Card:** Share live location coordinates with formatted street labels.
    * 📸 **Photo Attachment Card:** Share photo attachments of equipment/leaks with contextual status.
  * **Bilingual Quick Suggestion Chips:** Horizontal scrollable chips in Bengali and English (e.g., *"কতক্ষণ লাগবে ভাই?"*, *"দরজার সামনে আছি"*, *"গেইটের বেল বাজান"*, *"Flat / Flat number?"*, *"Call me on arrival"*). Tapping instantly sends the message.
  * **Realistic Simulated Auto-Reply Engine:** Dispatches context-aware automated replies after displaying an animated typing indicator bubble.
  * **Direct Phone Dialer:** Header phone icon triggers phone call via `Linking.openURL('tel:...')` with browser window fallback.
  * **React 19 Compiler Purity:** Handlers use isolated, pure sequential sequence IDs and time formatters to adhere to React Compiler rules without hydration warnings.

#### 2. `app/track-worker.tsx` *(Modified)*
* **Bug Fix:** Removed dead-end `Alert.alert('Message Worker', 'Opening chat with Rahim...')` popup.
* **Integration:** Replaced with direct navigation to `/chat`, pre-populating Rahim Uddin's name, plumbing role, and active request details.

#### 3. `app/worker-profile.tsx` *(Modified)*
* **Bug Fix:** Resolved web `Alert.alert` callback drop when clicking "Book Rahim Now", directly routing to `/track-worker`.
* **Action Bar Upgrade:** Added a dedicated "Message" button (`chatWorkerBtn`) alongside the Call and Book buttons in the sticky bottom action bar, linking directly into `/chat`.

#### 4. `app/job-details.tsx` *(Modified & Merged)*
* **Bug Fix:** Resolved dialog trap on job step advancement and "Complete Job & Collect ৳500".
* **Integration:** Maintained backward-compatibility for both `/job-chat` (Supabase backend) and direct `/chat` routing.

#### 5. `app/customer-dashboard.tsx` *(Reconciled with `dev`)*
* **Integration:** Replaced stub redirect with the complete, production-ready `CustomerDashboardScreen` from the `dev` branch, featuring active request feeds, proposal counters, and role switching.

#### 6. `app/welcome.tsx` *(Preserved & Updated)*
* **Integration:** Kept the standalone welcome & bilingual presentation page with language switcher (EN / বাংলা) and role selection triggers.

---

### B. Navigation & Shared Components (`components/`)

#### 7. `components/page-quick-switcher.tsx` *(Modified)*
* **Added Live Chat:** Registered `/chat` under the *"Community, Marketplace & Chat"* category with customized icon and description.
* **Fixed Icon Warning:** Replaced invalid icon name `'sparkles'` with `'creation'` for `MaterialCommunityIcons`.
* **Production Guard:** Added `if (!__DEV__) return null;` so the dev-only switcher is completely excluded from production bundles.

---

### C. Build Configuration & Tooling

#### 8. `app.json` *(Modified)*
* **Fix for `npx expo-doctor` Schema Check:**
  * Removed deprecated `expo.newArchEnabled: true` (New Architecture is enabled by default in Expo SDK 57).
  * Removed deprecated `expo.android.edgeToEdgeEnabled: true`.

#### 9. `package.json` & `package-lock.json` *(Modified)*
* **Aligned Expo SDK 57 Dependencies:**
  * `expo-haptics`: Updated from `~57.0.2` $\rightarrow$ `~57.0.3`
  * `expo-image`: Updated from `~57.0.3` $\rightarrow$ `~57.0.5`
  * `expo-system-ui`: Updated from `~57.0.3` $\rightarrow$ `~57.0.4`
  * `expo-web-browser`: Updated from `~57.0.2` $\rightarrow$ `~57.0.3`
* Synchronized `package-lock.json` lockfile for clean `npm ci` executions on Ubuntu CI runners.

#### 10. `.gitignore` *(Modified)*
* Added ignores for Python test artifacts and caches:
  ```gitignore
  # Python & Testing
  __pycache__/
  *.py[cod]
  *$py.class
  .pytest_cache/
  ```

---

### D. Documentation & Bug Reports

#### 11. `bug.md` *(New File — 468 lines)*
* Detailed catalog of 22 identified and resolved bugs across the application, categorized by:
  * **BUG-001 to BUG-004:** Web Alert popup callback dropping navigation events.
  * **BUG-005 to BUG-008:** Leaflet map container height zeroing & SSR iframe rendering.
  * **BUG-009 to BUG-012:** Bengali localization font cutoffs and key mismatches.
  * **BUG-013 to BUG-016:** Back navigation loops on empty browser histories.
  * **BUG-017 to BUG-020:** Form validation and budget formatting bugs.
  * **BUG-021 to BUG-022:** Dev tool leak in production builds and icon family warnings.

#### 12. `test case.md` *(New File — 876 lines)*
* Comprehensive formal test specifications covering Modules 1 through 8:
  * Module 1: Onboarding & Welcome Screen (`/welcome`)
  * Module 2: Role Selection & Authorization Routing (`/role-selection`)
  * Module 3: Customer Service Marketplace & Emergency Modal (`/`)
  * Module 4: Worker Profile & Booking Flow (`/worker-profile`)
  * Module 5: Worker Dashboard & Availability Toggle (`/worker-dashboard`)
  * Module 6: On-Site Job Details & Lifecycle Workflow (`/job-details`)
  * Module 7: Live Leaflet Worker Tracking (`/track-worker`)
  * Module 8: Live In-App Chat & Messaging (`/chat`)

---

### E. Automated Selenium Test Suite (`tests/`)

#### 13. `tests/conftest.py` *(New File — 168 lines)*
* Shared Pytest fixtures with Chrome WebDriver configurations:
  * Mobile device emulation (iPhone 14 / Safari viewport dimensions `390x844`).
  * Headless switch (`HEADLESS=1`) and headed debug options.
  * Custom explicit wait utilities (`wait_for_app_ready`, `safe_click`, `wait_for_text_content`) designed specifically for React Native Web DOM hydration.

#### 14. `tests/test_full_lifecycle.py` *(New File — 214 lines)*
* Single continuous end-to-end automated lifecycle execution:
  * Customer onboard $\rightarrow$ Selects Emergency Plumbing fix $\rightarrow$ Live tracking map $\rightarrow$ Worker dashboard toggle $\rightarrow$ Urgent job dispatch accept $\rightarrow$ Status advancement (Arrived $\rightarrow$ In Progress $\rightarrow$ Completed) $\rightarrow$ Settlement.

#### 15. `tests/test_chat.py` *(New File — 78 lines)*
* Automated validation for:
  * Direct rendering of `/chat` with recipient headers and service context banner.
  * Quick chip interaction with automated reply verification.
  * Custom message sending, input clearing, and thread updates.
  * Navigation from `/track-worker` directly into `/chat`.

#### 16. Additional Modular Tests:
* `tests/test_track_worker.py`: Validates live ETA countdown, action buttons, and back navigation.
* `tests/test_worker_profile.py`: Tests review lists, skills chips, booking, and chat buttons.
* `tests/test_customer_dashboard.py`: Tests request creation and community links.
* `tests/test_worker_dashboard.py`: Tests online/offline toggle, stats cards, and new job banner.
* `tests/test_job_details.py`: Tests step progression from Arrived to Complete.
* `tests/test_welcome.py`: Tests EN / বাংলা language toggling and onboarding navigation.
* `tests/test_navigation.py`: Tests Bottom Navigation tab switching and route retention.
* `tests/test_live_showcase.py`: Interactive demonstration flow for live client presentations.
* `tests/test_community.py`: Complete Community Workflow end-to-end tests (feed rendering, role switching, commenting, worker proposal submission, and customer proposal acceptance).

### E. Community Workflow Bug Fixes (`features/community/`, `app/job-board.tsx`, `app/community.tsx`)

1. **Unconditional Route Access (`app/_layout.tsx`):**
   * Added `/community`, `/job-board`, `/job-details`, `/job-chat`, and demo screens to `PUBLIC_PATHS`.
   * Unauthenticated and demo visitors are no longer bounced back to `/` when exploring the marketplace.

2. **Non-Blocking Authentication Fallback (`features/community/community.service.ts`):**
   * Fixed fatal `Authentication required.` crash on `createServiceRequest`, `addServiceRequestComment`, `submitServiceProposal`, and `toggleServiceRequestReaction`.
   * Gracefully falls back to demo/visitor identities when running offline or without Supabase cloud session.
   * Added optional `customerId`, `authorId`, and `workerId` caller overrides to input types.

3. **Instant Offline/Demo Repository Execution (`features/community/community.repository.ts`):**
   * Bypasses 30-second network timeouts on dummy Supabase credentials (`isOfflineOrDemo` guard).
   * Seed requests, proposals, comments, and reactions load and mutate instantaneously in-memory.

4. **Community Create Button & Role Switcher (`app/community.tsx`):**
   * Made the `+` (Create Request) button always visible in the header (no longer hidden behind strict customer role).
   * Added dual role toggle pills (`Customer Mode (Post & Hire)` vs. `Worker Mode (Submit Proposals)`) directly in the community subheader.
   * Switching roles automatically bootstraps demo identity in `session-context.tsx`.

5. **Proposal Submission & Acceptance Lifecycle (`app/job-board.tsx`):**
   * Fixed silent no-op when clicking "Send Proposal" if role wasn't pre-set to worker. Automatically activates worker mode and submits proposal.
   * Fixed proposal acceptance blocker: Customer can now accept proposals on both their own requests and demo requests.
   * Proposal status correctly transitions to `assigned`, revealing the "Worker selected" banner with direct "Progress" and "Chat" buttons.

6. **Public Discussion Comments (`app/job-board.tsx`):**
   * Comments now post seamlessly without auth traps and immediately re-render in the Public Discussion thread.

---

## 3. GitHub Actions CI Verification

The entire test pipeline was verified both locally and remotely on GitHub Actions runner (`ubuntu-latest` / Node 22):

| Check Step | Command | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Install** | `npm ci` | :white_check_mark: Passed | Clean install from updated `package-lock.json` |
| **Expo Doctor** | `npx expo-doctor` | :white_check_mark: Passed | 21/21 checks passed (schema & package versions clean) |
| **TypeScript** | `npx tsc --noEmit` | :white_check_mark: Passed | 0 type errors across whole codebase |
| **ESLint** | `npm run lint` | :white_check_mark: Passed | Clean across React 19 compiler rules |
| **Selenium Tests**| `pytest tests/test_community.py` | :white_check_mark: Passed | 4/4 community lifecycle tests passed |
| **Web Build** | `npm run build:web` | :white_check_mark: Passed | 29 static routes successfully exported to `dist/` |

---

## 4. Verification Instructions

To run the application locally:
```bash
npx expo start --web
```

To run the automated Selenium tests:
```bash
# Run community workflow tests
python -m pytest tests/test_community.py -v

# Run chat tests
python -m pytest tests/test_chat.py -v

# Run role permissions and proposal workflow tests
python -m pytest tests/test_role_permissions.py -v

# Run full end-to-end lifecycle visibly in Chrome
python -m pytest tests/test_full_lifecycle.py -v -s
```

---

## 5. Marketplace Role Permissions, Proposal Lifecycle & Request Publishing Audit & Implementation

### A. Root Causes Identified
1. **Broken "Publish Request" Workflow:**
   * The `Publish Request` button in `app/job-board.tsx` was performing client-side mock role changes and had mismatched validation logic where web alert popups failed to trigger or trapped asynchronous navigation.
   * Input state was susceptible to race conditions and multiple clicks without an atomic `disabled={saving}` visual indicator or inline validation messages.
   * Service request creation did not enforce server-side validation bounds (title length 5–120, description 10–5000, location 2–200, positive numeric budget).
2. **Ambiguous User Identity & Self-Acceptance Vulnerability:**
   * In presentation/offline demo mode, customer and worker identities previously defaulted to the same generic user identifier (`cust-demo-1`), creating a scenario where a user could effectively propose to their own requests and accept their own proposals.
   * The backend/service lacked explicit rejection when a user attempted to submit a proposal on a request they authored.
3. **Missing Proposal Duplicate & Ineligible State Protection:**
   * Workers were able to submit multiple pending proposals for the same service request.
   * Proposals could be submitted for non-open requests (e.g. `assigned`, `ordered`, `completed`, `cancelled`).
4. **Non-Atomic Proposal Acceptance:**
   * Proposal acceptance previously did not lock the request row (`FOR UPDATE`) or atomically transition competing proposals to `declined`, leaving open potential race conditions where concurrent workers could be accepted for the same single job.
5. **Database RLS Policies Lacked Strict Role Verifications:**
   * Supabase Row Level Security policies previously only validated `auth.uid() = customer_id` without verifying that the authenticated user possesses the active `customer` or `worker` role in `user_roles` and `profiles.active_role`.

---

### B. Business Rules & Safeguards Implemented
| Rule # | Business Rule | Enforcement Layers |
| :--- | :--- | :--- |
| **Rule 1** | Only customers can create and publish service requests. | Database RLS (`service_requests_insert_policy`), Service (`createServiceRequest`), Repository, and Frontend (`job-board.tsx`, `community.tsx`). |
| **Rule 2** | Customers cannot submit worker proposals. | Database RLS (`service_proposals_insert_policy`), Trigger (`check_proposal_integrity`), Service (`submitServiceProposal`), and UI guards. |
| **Rule 3** | Workers cannot publish customer job requests. | Database RLS, Service role verification (`requireAuthenticatedActor('customer')`), UI role guard blocking form entry. |
| **Rule 4** | Customers cannot accept their own jobs as workers or propose to their own requests. | Trigger (`trg_check_proposal_integrity`), Service check (`request.customer_id !== actor.id`), UI conditional rendering. |
| **Rule 5** | Workers cannot accept their own proposals. | DB RPC `accept_service_proposal` (`actor_id != p_worker_id`), Service (`acceptServiceProposal`), Repository, and UI. |
| **Rule 6** | Only the customer owner of a job can accept a proposal for that job. | DB RPC `accept_service_proposal` (`actor_id = v_customer_id`), Service verification (`request.customer_id === actor.id`), UI. |
| **Rule 7** | A worker cannot submit multiple active proposals for the same job. | DB unique partial constraint / trigger, Service query check, Repository check, UI replacement with "You have submitted a proposal" banner. |
| **Rule 8** | Proposals can only be submitted for `open` service requests. | Trigger + Service check (`request.status === 'open'`), UI button hidden on non-open requests. |
| **Rule 9** | Acceptance is atomic: winning proposal becomes `accepted`, request becomes `assigned`, and competing pending proposals are marked `declined`. | Supabase transactional stored procedure with `FOR UPDATE` row lock; mirrored in repository in-memory fallback. |
| **Rule 10** | Strict Request Lifecycle transitions: `open` -> `assigned` -> `ordered` -> `completed` / `cancelled`. | DB constraints and `advanceServiceRequestStatus` validation. |

---

### C. Database Migration & Security Safeguards
* **File:** `supabase/migrations/20261011190000_enforce_strict_marketplace_roles.sql`
  * **RLS Policies:** Tightened `service_requests` and `service_proposals` to cross-reference `user_roles` and `profiles.active_role`.
  * **Trigger `check_proposal_integrity()`:** Enforces that `worker_id != customer_id`, the request is currently `open`, and active duplicate proposals from the same worker are blocked.
  * **Stored Procedure `accept_service_proposal(p_proposal_id uuid)`:**
    * Acquires exclusive lock (`SELECT ... FOR UPDATE`) on the request.
    * Verifies `auth.uid() = request.customer_id` and `auth.uid() != proposal.worker_id`.
    * Atomically updates winning proposal to `accepted`, request to `assigned`, and all competing proposals to `declined`.

---

### D. Automated Test Verification Results
All 8 minimum acceptance criteria scenarios were implemented and verified with automated Selenium/pytest suites:

| Scenario / Test | Expected Result | Actual Result |
| :--- | :--- | :--- |
| `test_01_customer_publishes_valid_request` | Success; job is persisted & rendered with detail | :white_check_mark: PASSED |
| `test_02_worker_attempts_to_publish_rejected` | Blocked server/UI side; alert shown | :white_check_mark: PASSED |
| `test_03_publish_request_form_invalid_data_shows_errors` | Validation errors shown; request blocked | :white_check_mark: PASSED |
| `test_04_customer_cannot_submit_proposal_on_own_job` | Propose button hidden & API call rejected | :white_check_mark: PASSED |
| `test_05_worker_submits_proposal_and_customer_accepts` | End-to-end success; job marked `assigned` | :white_check_mark: PASSED |
| `test_06_worker_cannot_accept_own_proposal` | Accept button hidden & API call rejected | :white_check_mark: PASSED |
| `test_07_customer_cannot_accept_another_customers_job` | Non-owner cannot accept; blocked | :white_check_mark: PASSED |
| `test_08_proposal_rejected_on_assigned_job` | Propose button hidden & API rejects | :white_check_mark: PASSED |
| `tests/test_community.py` (Full Suite) | 4/4 community lifecycle tests pass | :white_check_mark: PASSED |

---

## 6. Floating Chat Widget, Recent Chat History & Navigation Integration

### A. Floating Chat Widget (`components/floating-chat-widget.tsx`)
* **Component Architecture**: Built a dedicated, reusable floating chat widget mounted globally in `app/_layout.tsx` so both customers and workers have immediate access from any screen.
* **Floating Trigger Button**:
  * Positioned on the bottom-right corner (`bottom: 24, right: 18`) with elevation and pulse styling.
  * Real-time unread badge displaying pending message count.
* **Recent Chat History & Multi-Conversation Drawer**:
  * Tabbed switcher between **Live Chat** and **Recent History**.
  * Multi-conversation support tracking distinct customer/worker threads:
    * **Rahim Uddin** (Verified Plumber • *Plumbing Leak Fix*)
    * **Kamal Hossain** (Electrician • *Main Breaker Tripping*)
    * **ThiKorben Support Desk** (*Order & Safety Inquiries*)
  * Displays last message preview, relative timestamps, and unread badges.
* **Full In-Widget Messaging Capabilities**:
  * Instant custom text sending with delivery timestamps and double-check read receipts (`✓✓`).
  * **Bilingual Quick Chips**: One-tap replies in Bengali and English (*"কতক্ষণ লাগবে ভাই?"*, *"দরজার সামনে আছি"*, *"গেইটের বেল বাজান"*, *"Flat number?"*, *"Call on arrival"*).
  * **Rich Attachments**: 📍 Send live GPS Pin cards; 📸 Send photo attachments.
  * **Simulated Automated Response Engine**: Generates realistic typing indicators (*"Rahim is typing..."*) and contextual worker replies.
  * **Direct Phone Dialer**: Tap the phone icon to dial the worker or customer directly (`tel:...`).
  * **Fullscreen Expansion**: One-click expand button transitions smoothly into the dedicated `/chat` screen.
  * **Persistent Storage**: All sent messages, photo cards, and location pins are saved to `localStorage` (`thikorben_floating_chat_conversations_v2`), preserving conversations across page reloads.

### B. Customer Dashboard Direct Shortcuts (`app/customer-dashboard.tsx`)
* Added a responsive 2x3 quick-action grid on `/customer-dashboard` providing 1-click access to:
  * 📍 **Live Tracking** (`/track-worker`): Interactive Leaflet map, GPS route, 12m ETA countdown.
  * 🛒 **Hardware Shop** (`/shop`): Sanitary, electrical & repair supplies catalog.
  * 📦 **Materials & Parts** (`/job-materials`): Smart product recommendations & customer material approval.
  * 💬 **Live Chat** (`/chat`): Direct worker messaging & photo sharing.
  * 👥 **Community** (`/community`): Browse active requests and quotes.
  * 🔧 **Worker Mode** (`/role-selection`): Switch roles securely.

### C. Layout & Navigation Hierarchy (`app/_layout.tsx`, `components/page-quick-switcher.tsx`)
* Mounted `<FloatingChatWidget />` globally in `AppNavigator`.
* Repositioned the Dev Page Switcher to bottom-left (`bottom: 24, left: 18`) to eliminate crowding and give the floating chat button prime visibility.

### D. Automated Test Verification
New test suite added in `tests/test_floating_chat.py`:
```bash
python -m pytest tests/test_floating_chat.py -v
```
| Test Scenario | Description | Result |
| :--- | :--- | :--- |
| `test_floating_chat_button_renders_globally` | Verifies floating chat FAB renders on the screen | :white_check_mark: PASSED |
| `test_floating_chat_opens_and_sends_message` | Opens chat drawer, types message, and verifies rendered in thread | :white_check_mark: PASSED |
| `test_floating_chat_recent_history_switching` | Opens Recent History tab, displays conversations, and switches recipient | :white_check_mark: PASSED |
| `test_floating_chat_hidden_on_fullscreen_chat_page` | Verifies floating widget is suppressed on `/chat` so send button is never covered | :white_check_mark: PASSED |
| `test_start_new_chat_with_new_worker_from_pro_directory` | Starts a new chat thread with verified pros from directory roster | :white_check_mark: PASSED |
| `test_front_page_has_prominent_signup_button` | Verifies front page provides explicit, visible Sign Up buttons in header and hero | :white_check_mark: PASSED |

---

## 7. Front Page Sign Up Visibility & Authentication Accessibility (`app/index.tsx`)

### The Problem
Previously on the front page (`app/index.tsx`), new users could not locate a clear **Sign Up** button:
* The top navigation bar only showed the brand logo and language switchers (EN / বাংলা), with no auth action buttons.
* The hero action group presented a generic *"Get Started"* label which was ambiguous.
* If a session was active, the hero buttons would transition into *"Continue to ThiKorben"*, making it impossible for visitors to quickly sign up a new account.

### The Fix
* **Prominent Header Auth Actions**: Added a dedicated top-right authentication group:
  * **Sign In** button linking to `/auth/login`.
  * **Sign Up** button (`headerSignupBtn`) styled with brand orange (`#F7941D`), white text, and `person-add` icon linking directly to `/auth/signup`.
  * If authenticated, also displays a **Dashboard** quick shortcut.
* **Hero Section Dual Actions**:
  * Added an explicit **Sign Up Free** (`hero-signup-btn`) primary action button linking directly to `/auth/signup`.
  * Preserved the secondary Sign In / Dashboard navigation.
* **Bilingual Translation Support**: Added `signup: 'Sign Up'` and `signup: 'সাইন আপ'` across both English and Bengali dictionaries in `COPY`.

---

## 8. Dynamic Floating Chat with New Workers & Full-Screen Chat Suppression (`components/floating-chat-widget.tsx`)

### The Problem
1. **Button Covering Full-Screen Chat**: When navigating directly to `/chat` or `/job-chat`, the floating chat trigger and dev switcher stacked in the bottom right corner, literally covering the message input box and Send button.
2. **Static Worker List**: The floating widget only initialized with hardcoded conversations (Rahim, Kamal, Support Desk) and provided no interface to discover, select, or start a chat with other workers or when booking a new pro.

### The Fix
1. **Full-Screen Chat Suppression Guard**:
   * Integrated `usePathname()` in `FloatingChatWidget`.
   * If `pathname === '/chat' || pathname === '/job-chat'`, the widget immediately returns `null`. This guarantees the floating button never covers the full-screen chat input or send buttons.
2. **Directory of Verified Pros in Recent History Tab**:
   * Exported `AVAILABLE_WORKERS` catalog including verified trade specialists:
     * **Rahim Uddin** (Verified Plumber)
     * **Kamal Hossain** (Electrician)
     * **Tariqul Islam** (Master Carpenter)
     * **Belal Ahmed** (Home Painter)
     * **Shahinur Rahman** (Appliance Technician)
     * **ThiKorben Support Desk**
   * Under *"Active Conversations"*, added a dedicated *"Start New Chat with Pro"* roster where users can tap **Chat** / **Open** next to any professional.
   * Dynamically instantiates a new conversation thread, selects that worker, stores it in `localStorage`, and transitions directly into the active chat thread.
3. **Global Cross-Screen Event Bus (`thikorben_open_chat`)**:
   * Added `openFloatingWorkerChat(...)` helper and a `window.addEventListener('thikorben_open_chat', ...)` listener.
   * Any screen (such as worker profiles, proposal acceptances, or job tracking) can trigger a chat with a specific worker by dispatching this event.
4. **Header Pro Switcher**: Added a quick Pro switcher button (`people` icon) in the widget top bar allowing immediate switching between active workers.

---

## 9. Page Quick Switcher De-cluttering & Route Suppression (`components/page-quick-switcher.tsx`)

### The Problem
* The dev page switcher floating button was manually imported and rendered in multiple individual screens (`app/worker-profile.tsx`, `app/welcome.tsx`, `app/track-worker.tsx`) in addition to being rendered globally in `app/_layout.tsx`.
* It appeared on screens where it caused clutter (including full-screen chat and auth routes).

### The Fix
* **Removed Redundant Local Usages**: Deleted all duplicate `<PageQuickSwitcher />` component instances and imports from `app/worker-profile.tsx`, `app/welcome.tsx`, and `app/track-worker.tsx`.
* **Suppressed on Chat & Auth Routes**: Added route guards to automatically suppress rendering on:
  * `/chat`
  * `/job-chat`
  * `/auth/login`
  * `/auth/signup`
  * `/auth/role-select`
* **Session Dismissal Persistence**: When the user taps the `(X)` close button on the floating switcher container, the dismissal state is saved to `sessionStorage` (`thikorben_pages_dismissed`), ensuring it remains hidden across subsequent screen navigations during that session.



