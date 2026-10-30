import { BooleanProperty, NumberProperty, Property, StringProperty } from 'scenerystack/axon';

export type LightWavelength = 'white' | 'blue' | 'red' | 'green';
export type PlantType = 'c3' | 'c4';
export type TabView = 'macro' | 'micro' | 'graphs';

export interface SimParticle {
  id: number;
  type: 'photon' | 'water' | 'co2' | 'oxygen' | 'glucose' | 'proton' | 'electron';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color?: string;
  size?: number;
  target?: string;
}

export class PhotosynthesisModel {
  // Playback state
  readonly isPlayingProperty = new BooleanProperty(true);
  readonly simSpeedProperty = new NumberProperty(1); // 0.5, 1, 2

  // Environmental inputs
  readonly lightIntensityProperty = new NumberProperty(75); // 0 - 100 %
  readonly lightWavelengthProperty = new StringProperty('white') as Property<LightWavelength>;
  readonly co2ConcentrationProperty = new NumberProperty(450); // 100 - 1500 ppm
  readonly waterLevelProperty = new NumberProperty(70); // 0 - 100 %
  readonly temperatureProperty = new NumberProperty(25); // 5 - 45 °C
  readonly plantTypeProperty = new StringProperty('c3') as Property<PlantType>;

  // Display and view options
  readonly activeTabProperty = new StringProperty('macro') as Property<TabView>;
  readonly showFormulasProperty = new BooleanProperty(true);
  readonly showPhotonsProperty = new BooleanProperty(true);
  readonly showElectronsProperty = new BooleanProperty(true);
  readonly showLimitingFactorProperty = new BooleanProperty(true);
  readonly showStomataProperty = new BooleanProperty(true);

  // Computed outputs
  readonly photosynthesisRateProperty = new NumberProperty(0); // 0 - 100 %
  readonly stomataOpennessProperty = new NumberProperty(1); // 0 - 1
  readonly lightFactorProperty = new NumberProperty(0); // 0 - 1
  readonly co2FactorProperty = new NumberProperty(0); // 0 - 1
  readonly waterFactorProperty = new NumberProperty(0); // 0 - 1
  readonly tempFactorProperty = new NumberProperty(0); // 0 - 1
  readonly limitingFactorProperty = new StringProperty('Optimal');
  readonly atpProductionRateProperty = new NumberProperty(0);
  readonly nadphProductionRateProperty = new NumberProperty(0);

  // Accumulators
  readonly glucoseTotalProperty = new NumberProperty(0); // mg
  readonly oxygenTotalProperty = new NumberProperty(0); // mL
  readonly atpLevelProperty = new NumberProperty(50); // % pool
  readonly nadphLevelProperty = new NumberProperty(50); // % pool

  // Micro view rotary angle
  readonly atpSynthaseAngleProperty = new NumberProperty(0);
  readonly calvinCycleAngleProperty = new NumberProperty(0);

  // Particles
  macroParticles: SimParticle[] = [];
  microParticles: SimParticle[] = [];
  private nextParticleId = 1;
  private particleSpawnTimer = 0;

  constructor() {
    this.updateRates();

    // Listen to changes in controls to immediately update rates
    const update = () => this.updateRates();
    this.lightIntensityProperty.lazyLink(update);
    this.lightWavelengthProperty.lazyLink(update);
    this.co2ConcentrationProperty.lazyLink(update);
    this.waterLevelProperty.lazyLink(update);
    this.temperatureProperty.lazyLink(update);
    this.plantTypeProperty.lazyLink(update);
  }

  /**
   * Calculate photosynthetic rate based on Blackman's law of limiting factors
   * and biological enzyme kinetics.
   */
  updateRates(): void {
    const light = this.lightIntensityProperty.value;
    const wavelength = this.lightWavelengthProperty.value;
    const co2 = this.co2ConcentrationProperty.value;
    const water = this.waterLevelProperty.value;
    const temp = this.temperatureProperty.value;
    const plantType = this.plantTypeProperty.value;

    // 1. Wavelength absorption efficiency of Chlorophyll a & b
    let wavelengthEff = 1.0;
    if (wavelength === 'white') {
      wavelengthEff = 0.95;
    } else if (wavelength === 'blue') {
      // 450nm peak absorption
      wavelengthEff = 1.0;
    } else if (wavelength === 'red') {
      // 660nm peak absorption
      wavelengthEff = 0.92;
    } else if (wavelength === 'green') {
      // 530nm chlorophyll reflects green! Very low absorption (~15%)
      wavelengthEff = 0.15;
    }

    // Effective light factor (Michaelis-Menten saturation)
    const effectiveLight = (light * wavelengthEff) / 100;
    const fLight = effectiveLight / (effectiveLight + 0.25);

    // 2. Stomata openness depends directly on hydration
    // When water < 20%, guard cells lose turgor and close stomata to prevent dehydration
    let stomata = 0;
    if (water <= 10) {
      stomata = 0.05;
    } else if (water <= 40) {
      stomata = 0.05 + 0.65 * ((water - 10) / 30);
    } else {
      stomata = 0.70 + 0.30 * Math.min(1, (water - 40) / 40);
    }
    this.stomataOpennessProperty.value = stomata;

    // 3. CO2 factor: depends on atmospheric CO2 and stomata conductance
    const effectiveCO2 = co2 * stomata;
    const kmCO2 = plantType === 'c4' ? 180 : 380; // C4 plants have PEP carboxylase with much higher affinity
    const fCO2 = effectiveCO2 / (effectiveCO2 + kmCO2);

    // 4. Water factor (as a biochemical reagent in photolysis)
    const fWater = Math.min(1, Math.max(0.05, water / 30));

    // 5. Temperature factor (Enzyme kinetics: Arrhenius rise + denaturation cliff)
    let fTemp = 0;
    const optTemp = plantType === 'c4' ? 35 : 28;
    if (temp < 5) {
      fTemp = 0.02;
    } else if (temp <= optTemp) {
      // Exponential / Q10 rise
      fTemp = Math.max(0.05, Math.pow((temp - 4) / (optTemp - 4), 1.6));
    } else if (temp <= 48) {
      // Denaturation cliff
      const drop = (temp - optTemp) / (48 - optTemp);
      fTemp = Math.max(0, 1 - Math.pow(drop, 1.8));
    } else {
      fTemp = 0;
    }

    this.lightFactorProperty.value = fLight;
    this.co2FactorProperty.value = fCO2;
    this.waterFactorProperty.value = fWater;
    this.tempFactorProperty.value = fTemp;

    // Overall rate is governed by the limiting factor (Liebig's Law of the Minimum / Blackman)
    // with smooth biochemical coupling
    const minFactor = Math.min(fLight, fCO2, fWater, fTemp);
    const combinedRate = 100 * Math.min(1, minFactor * (0.8 + 0.2 * ((fLight + fCO2 + fWater + fTemp) / 4)));
    this.photosynthesisRateProperty.value = Math.max(0, combinedRate);

    // Determine current limiting factor
    if (fWater < 0.25 || stomata < 0.2) {
      this.limitingFactorProperty.value = 'Water deficit (Stomata closed)';
    } else if (fLight <= minFactor + 0.05) {
      if (wavelength === 'green') {
        this.limitingFactorProperty.value = 'Light spectrum (Green reflected)';
      } else if (light < 20) {
        this.limitingFactorProperty.value = 'Low light intensity';
      } else {
        this.limitingFactorProperty.value = 'Light saturation limit';
      }
    } else if (fCO2 <= minFactor + 0.05) {
      this.limitingFactorProperty.value = 'CO₂ concentration';
    } else if (temp > 38) {
      this.limitingFactorProperty.value = 'Excess heat (Enzymes denaturing)';
    } else if (temp < 15) {
      this.limitingFactorProperty.value = 'Low temperature (Enzyme kinetics slow)';
    } else {
      this.limitingFactorProperty.value = 'Near optimal conditions ✨';
    }

    // Micro pools
    this.atpProductionRateProperty.value = fLight * 100;
    this.nadphProductionRateProperty.value = fLight * fWater * 100;
  }

  step(dt: number): void {
    if (!this.isPlayingProperty.value) return;

    const scaledDt = dt * this.simSpeedProperty.value;
    const rate = this.photosynthesisRateProperty.value;

    // Accumulate total glucose and oxygen
    if (rate > 0) {
      const glucoseProduced = (rate / 100) * 0.4 * scaledDt;
      this.glucoseTotalProperty.value += glucoseProduced;
      this.oxygenTotalProperty.value += (rate / 100) * 0.8 * scaledDt;

      // Micro rotary animations
      this.atpSynthaseAngleProperty.value = (this.atpSynthaseAngleProperty.value + (rate * 0.08) * scaledDt * 6) % (Math.PI * 2);
      this.calvinCycleAngleProperty.value = (this.calvinCycleAngleProperty.value + (rate * 0.03) * scaledDt * 6) % (Math.PI * 2);
    }

    // Step particle systems
    this.stepParticles(scaledDt);
  }

  private stepParticles(dt: number): void {
    const rate = this.photosynthesisRateProperty.value;
    const light = this.lightIntensityProperty.value;
    const wavelength = this.lightWavelengthProperty.value;
    const stomata = this.stomataOpennessProperty.value;

    this.particleSpawnTimer += dt;
    if (this.particleSpawnTimer > 0.12) {
      this.particleSpawnTimer = 0;

      // Spawn Photons if light > 0
      if (light > 5 && this.showPhotonsProperty.value) {
        let photonColor = '#fbbf24'; // white/sun gold
        if (wavelength === 'blue') photonColor = '#38bdf8';
        if (wavelength === 'red') photonColor = '#f87171';
        if (wavelength === 'green') photonColor = '#4ade80';

        const spawnCount = Math.ceil(light / 30);
        for (let i = 0; i < spawnCount; i++) {
          this.macroParticles.push({
            id: this.nextParticleId++,
            type: 'photon',
            x: 180 + Math.random() * 220,
            y: 40 + Math.random() * 20,
            vx: 0.4 + (Math.random() - 0.5) * 0.4,
            vy: 2.2 + Math.random() * 1.5,
            life: 0,
            maxLife: 80,
            color: photonColor,
            size: 4 + Math.random() * 2
          });
        }
      }

      // Spawn Water molecules from soil to roots
      if (this.waterLevelProperty.value > 15) {
        this.macroParticles.push({
          id: this.nextParticleId++,
          type: 'water',
          x: 230 + Math.random() * 140,
          y: 490 + Math.random() * 50,
          vx: (300 - (230 + Math.random() * 140)) * 0.015,
          vy: -1.2 - Math.random() * 0.8,
          life: 0,
          maxLife: 100,
          color: '#3b82f6',
          size: 4
        });
      }

      // Spawn CO2 drifting in air towards leaves
      if (stomata > 0.15 && this.co2ConcentrationProperty.value > 150) {
        this.macroParticles.push({
          id: this.nextParticleId++,
          type: 'co2',
          x: 440 + Math.random() * 60,
          y: 160 + Math.random() * 120,
          vx: -1.2 - Math.random() * 0.8,
          vy: (Math.random() - 0.5) * 0.6,
          life: 0,
          maxLife: 90,
          color: '#94a3b8',
          size: 5
        });
      }

      // Spawn Oxygen bubbling from leaves into air
      if (rate > 5) {
        const bubbleCount = Math.ceil(rate / 35);
        for (let i = 0; i < bubbleCount; i++) {
          this.macroParticles.push({
            id: this.nextParticleId++,
            type: 'oxygen',
            x: 270 + Math.random() * 70,
            y: 200 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.5 - Math.random() * 1.2,
            life: 0,
            maxLife: 85,
            color: '#67e8f9',
            size: 4.5
          });
        }
      }

      // Micro particles (protons, electrons)
      if (rate > 5 && this.showElectronsProperty.value) {
        // Electron along ETC
        this.microParticles.push({
          id: this.nextParticleId++,
          type: 'electron',
          x: 180,
          y: 300,
          vx: 1.8,
          vy: (Math.random() - 0.5) * 0.3,
          life: 0,
          maxLife: 120,
          color: '#facc15',
          size: 3.5
        });

        // Proton through ATP Synthase
        this.microParticles.push({
          id: this.nextParticleId++,
          type: 'proton',
          x: 420 + (Math.random() - 0.5) * 10,
          y: 350,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -1.8,
          life: 0,
          maxLife: 70,
          color: '#ec4899',
          size: 4
        });
      }
    }

    // Update macro particles
    for (let i = this.macroParticles.length - 1; i >= 0; i--) {
      const p = this.macroParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life >= p.maxLife) {
        this.macroParticles.splice(i, 1);
      }
    }

    // Update micro particles
    for (let i = this.microParticles.length - 1; i >= 0; i--) {
      const p = this.microParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life >= p.maxLife) {
        this.microParticles.splice(i, 1);
      }
    }
  }

  // Presets
  applyOptimalPreset(): void {
    this.lightIntensityProperty.value = 85;
    this.lightWavelengthProperty.value = 'white';
    this.co2ConcentrationProperty.value = 750;
    this.waterLevelProperty.value = 85;
    this.temperatureProperty.value = 28;
    this.plantTypeProperty.value = 'c3';
  }

  applyDroughtPreset(): void {
    this.lightIntensityProperty.value = 95;
    this.lightWavelengthProperty.value = 'white';
    this.co2ConcentrationProperty.value = 400;
    this.waterLevelProperty.value = 8;
    this.temperatureProperty.value = 41;
  }

  applyGreenFilterPreset(): void {
    this.lightIntensityProperty.value = 90;
    this.lightWavelengthProperty.value = 'green';
    this.co2ConcentrationProperty.value = 500;
    this.waterLevelProperty.value = 75;
    this.temperatureProperty.value = 26;
  }

  applyGreenhousePreset(): void {
    this.lightIntensityProperty.value = 100;
    this.lightWavelengthProperty.value = 'white';
    this.co2ConcentrationProperty.value = 1300;
    this.waterLevelProperty.value = 95;
    this.temperatureProperty.value = 30;
  }

  applyNightPreset(): void {
    this.lightIntensityProperty.value = 0;
    this.lightWavelengthProperty.value = 'white';
    this.co2ConcentrationProperty.value = 450;
    this.waterLevelProperty.value = 60;
    this.temperatureProperty.value = 18;
  }

  waterPlant(): void {
    this.waterLevelProperty.value = Math.min(100, this.waterLevelProperty.value + 35);
  }

  injectCO2(): void {
    this.co2ConcentrationProperty.value = Math.min(1500, this.co2ConcentrationProperty.value + 300);
  }

  resetAll(): void {
    this.isPlayingProperty.value = true;
    this.simSpeedProperty.value = 1;
    this.lightIntensityProperty.value = 75;
    this.lightWavelengthProperty.value = 'white';
    this.co2ConcentrationProperty.value = 450;
    this.waterLevelProperty.value = 70;
    this.temperatureProperty.value = 25;
    this.plantTypeProperty.value = 'c3';
    this.glucoseTotalProperty.value = 0;
    this.oxygenTotalProperty.value = 0;
    this.macroParticles = [];
    this.microParticles = [];
    this.updateRates();
  }
}

