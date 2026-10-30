# 🌿 Photosynthesis Interactive Lab Simulation

An interactive, PhET-style educational web simulation exploring the biophysics, biochemistry, and environmental kinetics of photosynthesis. Built using **SceneryStack** (the open-source foundation behind PhET Interactive Simulations), **TypeScript**, and **Vite**.

---

## 📖 Overview

This simulation provides an inquiry-based laboratory environment for students, educators, and researchers to explore how light, carbon dioxide ($CO_2$), water ($H_2O$), temperature, and plant physiology interact to drive photosynthetic energy conversion and glucose synthesis.

By bridging macro-scale botany with micro-scale bioenergetics, users can observe the macroscopic effects on whole plants while peering directly into thylakoid membranes to trace photon absorption, electron transport, proton pumping, ATP synthesis, and the Calvin-Benson cycle.

---

## ✨ Features & Simulation Views

The simulation is split into three interconnected views with synchronized reactive state:

### 1. 🌿 Plant & Environment (Macro View)
* **Plant Cutaway & Soil Cross-Section:** Visualizes the whole organism in a transparent growth container with roots, stem, vascular bundles, and leaves.
* **Particle Dynamics:** Live particle systems representing:
  * ☀️ Incoming photons (color-coded according to wavelength).
  * 💧 Water uptake by root hairs through the soil bed up into the xylem.
  * 💨 Atmospheric $CO_2$ entering stomatal pores.
  * 🫧 Transpired oxygen ($O_2$) bubbles and synthesized glucose ($C_6H_{12}O_6$) storage.
* **Dynamic Stomata & Guard Cells:** Guard cells react physiologically to soil moisture and hydration levels—closing under drought conditions to prevent desiccation while choking internal $CO_2$ supply.
* **Biomass & Gas Production Accumulators:** Live gauges tracking real-time photosynthetic rate ($0-100\%$), total cumulative glucose ($mg$), and cumulative oxygen volume ($mL$).

### 2. 🔬 Chloroplast & Electron Transport Chain (Micro View)
* **Thylakoid Membrane Architecture:** Displays Photosystem II (PSII), Cytochrome $b_6f$ complex, Photosystem I (PSI), and ATP Synthase.
* **Light-Dependent Reactions:**
  * **Photolysis of Water:** $2H_2O \to 4H^+ + 4e^- + O_2$ inside the thylakoid lumen.
  * **Electron Transport Chain (ETC):** High-energy electrons excited by light photons transfer through intermediate carriers to reduce $NADP^+$ into $NADPH$.
  * **Proton-Motive Force & Rotary ATP Synthase:** Protons accumulating in the lumen power the rotary molecular motor of ATP Synthase to generate ATP.
* **Light-Independent Reactions (Calvin-Benson Cycle):**
  * Stroma-located cyclical reaction consuming ATP and NADPH to fix $CO_2$ into glucose via Rubisco.
  * Animated energy carrier shuttles ($ATP \rightleftharpoons ADP + P_i$, $NADPH \rightleftharpoons NADP^+$).

### 3. 📊 Graphs & Action Spectrum (Analytical View)
* **Chlorophyll Absorption Spectrum:** Interactive spectral curve depicting Chlorophyll $a$ and $b$ absorption peaks (Blue $\sim 450\text{ nm}$, Red $\sim 660\text{ nm}$) and the green reflection trough ($\sim 530\text{ nm}$).
* **Kinetics & Response Curves:**
  * **Rate vs. Light Intensity:** Demonstrates light-limited linear rise and enzymatic saturation plateau.
  * **Rate vs. $CO_2$ Concentration:** Compares Michaelis-Menten affinity constants between C3 and C4 pathways.
  * **Rate vs. Temperature:** Illustrates Arrhenius enzymatic acceleration ($Q_{10}$) followed by sharp heat-induced enzyme denaturation.
* **Live Operating Points:** Real-time marker dots track the plant's current operational state on theoretical reaction curves.

---

## 🧬 Scientific & Biophysical Principles Modeled

1. **Blackman's Law of Limiting Factors & Liebig's Minimum:**
   Photosynthetic rate is determined primarily by the most deficient factor (light, temperature, water, or $CO_2$), with biochemical transitions:
   $$\text{Rate} \propto \min(f_{\text{light}}, f_{\text{CO}_2}, f_{\text{water}}, f_{\text{temp}})$$

2. **Wavelength Absorption Efficiency:**
   * **White Sunlight:** $\approx 95\%$ relative absorption efficiency.
   * **Blue ($450\text{ nm}$):** Maximum absorption efficiency ($100\%$).
   * **Red ($660\text{ nm}$):** High absorption efficiency ($92\%$).
   * **Green ($530\text{ nm}$):** Reflected by chlorophyll ($\approx 15\%$ efficiency), demonstrating why plants appear green.

3. **Stomatal Conductance & Drought Stress:**
   When soil moisture drops below critical thresholds ($<20\%$), guard cells lose turgor pressure and stomata close, severely restricting internal $CO_2$ diffusion regardless of ambient air concentration.

4. **C3 vs. C4 Carbon Fixation Pathways:**
   * **C3 Plants:** Standard Rubisco-mediated fixation with lower temperature optimum ($28^\circ\text{C}$) and higher $K_m$ for $CO_2$.
   * **C4 Plants:** PEP carboxylase pre-fixation mechanism with higher temperature optimum ($35^\circ\text{C}$) and strong performance under low atmospheric $CO_2$ or hot climates.

5. **Enzymatic Temperature Kinetics:**
   Combines exponential kinetic activation up to thermal optimum followed by conformational breakdown (denaturation) beyond $38-45^\circ\text{C}$.

---

## 🎛️ Interactive Controls Reference

| Control | Range / Options | Description |
| :--- | :--- | :--- |
| **Playback** | Play, Pause, Step ($+0.1\text{s}$), Reset | Control simulation time progression |
| **Speed Multipliers** | $0.5\times, 1.0\times, 2.0\times$ | Adjust particle and reaction animation speeds |
| **Light Intensity** | $0 - 100\%$ | Illuminance delivered by the ambient source |
| **Light Spectrum** | White (Sun), Blue ($450\text{ nm}$), Red ($660\text{ nm}$), Green ($530\text{ nm}$) | Adjusts spectral quality of photon emission |
| **$CO_2$ Concentration** | $100 - 1500\text{ ppm}$ | Ambient carbon dioxide concentration |
| **Water Level** | $0 - 100\%$ | Soil moisture and root hydration availability |
| **Temperature** | $5^\circ\text{C} - 45^\circ\text{C}$ | Ambient environmental temperature |
| **Plant Pathway** | C3 / C4 | Switch photosynthetic adaptation mechanism |
| **Quick Actions** | Water Plant ($+35\%$), $CO_2$ Pulse ($+300\text{ ppm}$) | Rapid environmental intervention buttons |
| **Display Toggles** | Formulas, Photons, Limiting Factors, Stomata | Enable or disable visual overlays and particle layers |

---

## 🏗️ Project Architecture

The codebase follows the Model-View-Controller (MVC) pattern powered by SceneryStack's scene graph and reactive property system:

```
lab-simulation-photosynthesis/
├── index.html                   # Entry point with responsive container
├── package.json                 # Dependencies and build scripts
├── vite.config.ts               # Vite configuration
├── diagnose.js                  # Headless browser diagnostic runner
└── src/
    ├── main.ts                  # Application bootstrap, navigation bar & loop
    ├── model/
    │   └── PhotosynthesisModel.ts  # Reactive Axon properties & biophysical formulas
    └── view/
        ├── ControlPanel.ts      # Sun UI sliders, buttons, and switches
        ├── MacroView.ts         # Scenery scene graph for macroscopic plant & soil
        ├── MicroView.ts         # Scenery scene graph for chloroplast & ETC
        └── GraphsView.ts        # Dynamic charts, response curves & action spectrum
```

### Key Libraries Used
* **`scenerystack/scenery`**: High-performance 2D scene graph rendering to Canvas, SVG, and DOM.
* **`scenerystack/axon`**: Reactive state management (`Property`, `DerivedProperty`, `BooleanProperty`, `NumberProperty`).
* **`scenerystack/sun`**: Accessible, tactile UI components (sliders, push buttons, checkboxes, panels).
* **`scenerystack/kite`**: Vector mathematical path and shape definition.
* **`scenerystack/dot`**: Math utilities, 2D ranges, vectors, and dimensions.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ recommended)
* `npm` or compatible package manager

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/lab-simulation-photosynthesis.git
cd lab-simulation-photosynthesis
npm install
```

### Development
Start the local development server with hot-module reloading:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Production Build
Compile TypeScript and generate an optimized production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Testing & Headless Diagnostics

The repository includes a diagnostic script `diagnose.js` using `puppeteer-core` to verify DOM mounting, scene-graph instantiation, and capture automated screenshot validation:

```bash
node diagnose.js
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
