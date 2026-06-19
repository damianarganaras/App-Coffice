
# OpenSpec Architecture & Context Document
## Project: Cafeteria Mobile PWA (Office Edition)
## Target Stack: React (Vite) + Zustand + Tailwind CSS + Framer Motion + GitHub Pages

This document serves as the absolute source of truth for the AI Agent (OpenCode) to generate, modify, and deploy the application. It contains strict technical boundaries, state schemas, and structural constraints.

---

## 1. System Architecture & Constraints

### 1.1 Routerless Navigation (Critical for GitHub Pages)
* **Constraint:** Do NOT use `react-router-dom` or any history-based routing. GitHub Pages returns a 404 on hard refreshes of deep paths unless complex redirection scripts are injected.
* **Execution:** Manage view state through a single global or local string enum state: `view: 'catalog' | 'summary'`.

### 1.2 Isolated Storage Engine (Zustand Persist)
To prevent structural data corruption when resetting orders, data must be bifurcated into two separate `localStorage` keys:
1. `cafe-active-order`: Volatile daily transaction state (items currently in the cart).
2. `cafe-inventory-storage`: Permanent custom catalog state (base items + items added by the user).

### 1.3 PWA Deployment Scope (Vite-Plugin-PWA)
* The PWA must support full offline functionality utilizing a Cache-First strategy for static assets.
* **GitHub Pages Base URL:** The build must injection-map the repository name via Vite's `base` configuration parameter (`base: '/<repo-name>/'`).

---

## 2. Requirements Specification

### 2.1 Functional Requirements (RF)
* **RF1 - Dual View Architecture:**
  * **Catalog View:** Grid/List layout showing product cards. Tapping a card increments its count by 1 immediately. Shows a dynamic badge with the current quantity if `quantity > 0`.
  * **Summary View:** Linear breakdown of active selections with explicit `[ + ]`, `[ - ]`, and `[ 🗑️ Delete ]` actions per row.
* **RF2 - Quick Toggle Utility:** The header must include instant-action buttons for switching layouts (Grid vs. List) and toggling dark/light modes without nested settings menus.
* **RF3 - Custom Inventory Creation:** A drawer or modal must allow users to append custom items (e.g., "Medialuna de grasa") by specifying a text name. These must be assigned a unique ID via `Date.now().toString()`.
* **RF4 - Global Order Flush:** A "Limpiar Pedido" action must drop all quantities to 0 in the active order store, leaving the custom inventory database untouched.
* **RF5 - Smart PWA Installation Prompt:** * Intercept `beforeinstallprompt` on Android/Chrome to trigger a custom UI button.
  * Detect iOS/Safari user agents to display an instructional modal ("Tap Share -> Add to Home Screen").

### 2.2 Non-Functional Requirements (RNF)
* **RNF1 - Touch Ergonomics:** All interactive elements must maintain a minimum bounding box of `48px x 48px` with safe margins to mitigate accidental fat-finger triggers on 6-inch viewports.
* **RNF2 - Viewport Restrictions:** Set `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />` to block accidental double-tap zoom intervals.
* **RNF3 - UI Responsiveness & Dark Mode:** Fluid switching using Tailwind's `class` mechanism. Dark mode must target `#1e1e2e` (Slate/Dark Palette) to prevent glare in office environments.
* **RNF4 - Instant Feedback Animating:** State transitions (incrementing counters, changing views, throwing alerts) must execute under 150ms using hardware-accelerated transitions via Framer Motion.

---

## 3. Core State Architecture (Data Models)

### 3.1 Inventory Store Schema
```typescript
interface Product {
  id: string;
  name: string;
  category: 'cafe' | 'infusion' | 'comida' | 'custom';
}

interface InventoryState {
  customProducts: Product[];
  addCustomProduct: (name: string) => void;
  removeCustomProduct: (id: string) => void;
}
// Persistent Key: 'cafe-inventory-storage'

```

### 3.2 Active Order Store Schema

```typescript
interface OrderState {
  items: Record<string, number>; // { [productId]: quantity }
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  deleteItem: (id: string) => void;
  clearOrder: () => void;
}
// Persistent Key: 'cafe-active-order'

```

### 3.3 System Initial Baseline Data

```json
[
  { "id": "b1", "name": "Café Negro", "category": "cafe" },
  { "id": "b2", "name": "Negro Doble", "category": "cafe" },
  { "id": "b3", "name": "Cortado", "category": "cafe" },
  { "id": "b4", "name": "Cortado Doble", "category": "cafe" },
  { "id": "b5", "name": "Lágrima", "category": "cafe" },
  { "id": "b6", "name": "Lágrima Doble", "category": "cafe" },
  { "id": "b7", "name": "Té", "category": "infusion" },
  { "id": "b8", "name": "Bizcochitos", "category": "comida" }
]

```

---

## 4. Execution Blueprint for the AI Agent (OpenCode)

To implement this application cleanly, follow this exact development sequence:

### Step 1: Initialization & Configurations

1. Initialize a Vite project with the React-TS or React-JS template.
2. Install dependencies: `npm install zustand tailwindcss postcss autoprefixer framer-motion`. Install `vite-plugin-pwa` as a dev dependency.
3. Configure `vite.config.js` to include the PWA plugin and set the matching `base: '/<your-repo-name>/'` pathing.
4. Set up Tailwind CSS with `darkMode: 'class'` enabled.

### Step 2: Store Instantiation

1. Create `src/store/useInventoryStore.js` utilizing Zustand's `persist` middleware. Load the baseline JSON data as static defaults, combining them with the `customProducts` array state.
2. Create `src/store/useOrderStore.js` with independent `persist` configurations to handle cart maps.

### Step 3: Layout Components

1. **`App.jsx`:** Holds the structural layout. Tracks current view (`'catalog' | 'summary'`) and current theme.
2. **`Header.jsx`:** Houses the title, the Dark Mode switch, and the Grid/List UI layout switcher.
3. **`CatalogView.jsx`:** Maps over the combined baseline and custom array. Dynamically toggles CSS classes between a `grid grid-cols-2 gap-4` layout and a full-width list container depending on preference state.
4. **`SummaryView.jsx`:** Generates list rows filtering out items with `quantity === 0`. Displays calculations alongside the prominent "Limpiar Pedido" trigger button.
5. **`PWAInstaller.jsx`:** Handles browser agent matching to toggle system prompts or show the manual iOS action layout.

### Step 4: Animation & Feedback Polish

1. Wrap catalog item click maps inside `<motion.button whileTap={{ scale: 0.96 }}>` blocks.
2. Animate view changes via `<AnimatePresence>` to execute clean slide or fade intervals.

---

## 5. Deployment Risk & Mitigation Ledger

| Technical Risk | Agent Operational Guardrail |
| --- | --- |
| **Asset Path Corruption (404 on deployment)** | The agent must reference assets using relative asset structures (`./pwa-192x192.png`) inside the PWA manifest rather than absolute routing blocks (`/pwa-192x192.png`). |
| **Stale Cache Conditions (App won't update)** | Configure `registerType: 'autoUpdate'` inside `VitePWA` setup blocks to drop active service worker claims instantly when a new production build lands on GitHub Pages. |
| **Data Loss on Clear Operations** | Strict segregation verification: Ensure `clearOrder()` code logic reinitializes the cart map state (`items: {}`) but completely bypasses any mutation to the inventory object store. |

```

```