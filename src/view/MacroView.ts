import { Node, Rectangle, Circle, Path, Text, RichText, LinearGradient, RadialGradient, Font } from 'scenerystack/scenery';
import { Shape } from 'scenerystack/kite';
import { PhotosynthesisModel, SimParticle } from '../model/PhotosynthesisModel.js';

export class MacroView extends Node {
  private readonly model: PhotosynthesisModel;
  private readonly particlesLayer = new Node();
  private readonly sunNode: Node;
  private readonly sunCorona: Circle;
  private readonly sunBody: Circle;
  private readonly stemPath: Path;
  private readonly leavesLayer = new Node();
  private readonly stomataPore: Path;
  private readonly stomataGuardLeft: Path;
  private readonly stomataGuardRight: Path;
  private readonly stomataStatusText: Text;
  private readonly rateMeterBar: Rectangle;
  private readonly rateMeterText: Text;
  private readonly glucoseText: Text;
  private readonly oxygenText: Text;
  private readonly statusBannerText: Text;
  private readonly statusBannerBg: Rectangle;

  constructor(model: PhotosynthesisModel) {
    super();
    this.model = model;

    // View bounds: 0, 0 to 760, 600
    const viewWidth = 760;
    const viewHeight = 600;

    // 1. Sky Background
    const skyGradient = new LinearGradient(0, 0, 0, 420)
      .addColorStop(0, '#0f172a')
      .addColorStop(0.4, '#1e293b')
      .addColorStop(1, '#334155');
    const sky = new Rectangle(0, 0, viewWidth, 430, { fill: skyGradient });
    this.addChild(sky);

    // 2. Ground & Soil Cutaway
    const ground = new Rectangle(0, 430, viewWidth, 170, { fill: '#1c1917' });
    this.addChild(ground);

    // Soil layer texture / line
    const groundLine = new Rectangle(0, 428, viewWidth, 4, { fill: '#3f2e1e' });
    this.addChild(groundLine);

    // 3. Transparent Plant Pot & Soil Bed
    const potShape = new Shape()
      .moveTo(220, 430)
      .lineTo(380, 430)
      .lineTo(360, 580)
      .lineTo(240, 580)
      .close();

    // Soil fill inside pot
    const soilNode = new Path(potShape, {
      fill: new LinearGradient(0, 430, 0, 580)
        .addColorStop(0, '#451a03')
        .addColorStop(1, '#291003'),
      stroke: '#78350f',
      lineWidth: 2
    });
    this.addChild(soilNode);

    // Pot Rim & Glass Outline
    const potRim = new Rectangle(210, 424, 180, 10, {
      fill: '#b45309',
      cornerRadius: 4,
      stroke: '#d97706',
      lineWidth: 1.5
    });
    this.addChild(potRim);

    // Pot Glass reflection outline
    const potOutline = new Path(potShape, {
      stroke: 'rgba(255, 255, 255, 0.15)',
      lineWidth: 3
    });
    this.addChild(potOutline);

    // 4. Roots System
    const rootsLayer = new Node();
    this.addChild(rootsLayer);
    this.renderRoots(rootsLayer);

    // 5. Plant: Stem & Leaves
    this.stemPath = new Path(new Shape(), {
      stroke: '#15803d',
      lineWidth: 10,
      lineCap: 'round'
    });
    this.addChild(this.stemPath);

    this.addChild(this.leavesLayer);

    // 6. The Sun / Grow Light
    this.sunNode = new Node({ x: 120, y: 110 });
    this.sunCorona = new Circle(55, {
      fill: 'rgba(251, 191, 36, 0.25)'
    });
    this.sunBody = new Circle(35, {
      fill: '#fbbf24',
      stroke: '#fef08a',
      lineWidth: 3
    });
    this.sunNode.addChild(this.sunCorona);
    this.sunNode.addChild(this.sunBody);
    this.addChild(this.sunNode);

    // Sun Rays
    const raysLayer = new Node();
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const ray = new Path(
        new Shape()
          .moveTo(Math.cos(angle) * 42, Math.sin(angle) * 42)
          .lineTo(Math.cos(angle) * 62, Math.sin(angle) * 62),
        { stroke: '#fde047', lineWidth: 3, lineCap: 'round' }
      );
      raysLayer.addChild(ray);
    }
    this.sunNode.addChild(raysLayer);

    // 7. Dynamic Particles Layer
    this.addChild(this.particlesLayer);

    // 8. Stomata Microscope Callout (right side)
    const stomataCallout = new Node({ x: 610, y: 140 });
    this.addChild(stomataCallout);

    // Background circle for magnifying callout
    const lensBg = new Circle(60, {
      fill: '#022c22',
      stroke: '#10b981',
      lineWidth: 3
    });
    stomataCallout.addChild(lensBg);

    // Callout title
    const lensTitle = new Text('Leaf Stoma (Micro)', {
      font: new Font({ size: 12, weight: 'bold' }),
      fill: '#6ee7b7',
      centerX: 0,
      y: -75
    });
    stomataCallout.addChild(lensTitle);

    // Guard cells and pore
    this.stomataGuardLeft = new Path(new Shape(), { fill: '#16a34a', stroke: '#15803d', lineWidth: 1.5 });
    this.stomataGuardRight = new Path(new Shape(), { fill: '#16a34a', stroke: '#15803d', lineWidth: 1.5 });
    this.stomataPore = new Path(new Shape(), { fill: '#0f172a' });

    stomataCallout.addChild(this.stomataGuardLeft);
    stomataCallout.addChild(this.stomataGuardRight);
    stomataCallout.addChild(this.stomataPore);

    this.stomataStatusText = new Text('Open (Turgid)', {
      font: new Font({ size: 11 }),
      fill: '#a7f3d0',
      centerX: 0,
      y: 68
    });
    stomataCallout.addChild(this.stomataStatusText);

    // Stomata callout pointer line to leaf
    const pointerLine = new Path(
      new Shape().moveTo(-60, 0).lineTo(-180, 70),
      { stroke: 'rgba(52, 211, 153, 0.4)', lineWidth: 1.5, lineDash: [4, 4] }
    );
    stomataCallout.addChild(pointerLine);

    // 9. Status Banner at Top Center
    const bannerContainer = new Node({ x: 380, y: 25 });
    this.addChild(bannerContainer);

    this.statusBannerBg = new Rectangle(-180, -16, 360, 32, {
      fill: '#064e3b',
      stroke: '#059669',
      lineWidth: 1.5,
      cornerRadius: 16
    });
    bannerContainer.addChild(this.statusBannerBg);

    this.statusBannerText = new Text('Photosynthesis Active', {
      font: new Font({ size: 13, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 0,
      centerY: 0
    });
    bannerContainer.addChild(this.statusBannerText);

    // 10. Chemical Equation Ribbon at Bottom Center
    const equationNode = new Node({ x: 18, y: 18 });
    this.addChild(equationNode);
    const eqBg = new Rectangle(0, 0, 724, 30, {
      fill: 'rgba(15, 23, 42, 0.85)',
      stroke: '#334155',
      lineWidth: 1,
      cornerRadius: 6
    });
    equationNode.addChild(eqBg);

    const eqText = new RichText(
      '<span style="color:#94a3b8">6</span><span style="color:#cbd5e1">CO<sub>2</sub></span> ' +
      '<span style="color:#64748b">+</span> ' +
      '<span style="color:#94a3b8">6</span><span style="color:#60a5fa">H<sub>2</sub>O</span> ' +
      '<span style="color:#64748b">+</span> ' +
      '<span style="color:#fde047">Light</span> ' +
      '<span style="color:#38bdf8">&rarr;</span> ' +
      '<span style="color:#f59e0b">C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span> ' +
      '<span style="color:#64748b">+</span> ' +
      '<span style="color:#94a3b8">6</span><span style="color:#38bdf8">O<sub>2</sub></span>',
      {
        font: new Font({ size: 13, weight: 'bold' }),
        x: 15,
        centerY: 15
      }
    );
    equationNode.addChild(eqText);

    // 11. Yield Meters (Glucose & Oxygen) Top Right
    const metersNode = new Node({ x: 550, y: 55 });
    this.addChild(metersNode);

    const metersBg = new Rectangle(0, 0, 195, 65, {
      fill: 'rgba(15, 23, 42, 0.9)',
      stroke: '#334155',
      cornerRadius: 8,
      lineWidth: 1
    });
    metersNode.addChild(metersBg);

    this.glucoseText = new Text('Glucose: 0.0 mg', {
      font: new Font({ size: 12, weight: 'bold' }),
      fill: '#fbbf24',
      x: 12,
      y: 12
    });
    metersNode.addChild(this.glucoseText);

    this.oxygenText = new Text('Oxygen: 0.0 mL', {
      font: new Font({ size: 12, weight: 'bold' }),
      fill: '#38bdf8',
      x: 12,
      y: 35
    });
    metersNode.addChild(this.oxygenText);

    // 12. Rate Meter Overlay (Bottom Left above soil)
    const rateGauge = new Node({ x: 25, y: 450 });
    this.addChild(rateGauge);

    const gaugeBg = new Rectangle(0, 0, 175, 48, {
      fill: 'rgba(15, 23, 42, 0.9)',
      stroke: '#334155',
      cornerRadius: 6,
      lineWidth: 1
    });
    rateGauge.addChild(gaugeBg);

    const gaugeLabel = new Text('Photosynthetic Rate', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#94a3b8',
      x: 10,
      y: 8
    });
    rateGauge.addChild(gaugeLabel);

    const barBg = new Rectangle(10, 26, 110, 12, {
      fill: '#1e293b',
      stroke: '#475569',
      lineWidth: 1,
      cornerRadius: 3
    });
    rateGauge.addChild(barBg);

    this.rateMeterBar = new Rectangle(10, 26, 0, 12, {
      fill: '#22c55e',
      cornerRadius: 3
    });
    rateGauge.addChild(this.rateMeterBar);

    this.rateMeterText = new Text('0 %', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#ffffff',
      x: 128,
      y: 25
    });
    rateGauge.addChild(this.rateMeterText);

    // Model listeners
    this.model.photosynthesisRateProperty.link(rate => this.updateRateDisplay(rate));
    this.model.stomataOpennessProperty.link(s => this.updateStomata(s));
    this.model.lightIntensityProperty.link(() => this.updateSunAppearance());
    this.model.lightWavelengthProperty.link(() => this.updateSunAppearance());
    this.model.waterLevelProperty.link(() => this.updatePlantWilting());

    this.updatePlantWilting();
    this.updateSunAppearance();
    this.updateStomata(this.model.stomataOpennessProperty.value);
    this.updateRateDisplay(this.model.photosynthesisRateProperty.value);
  }

  private renderRoots(parent: Node): void {
    // Generate organic root branches in soil
    const rootsShape = new Shape()
      .moveTo(300, 435)
      .lineTo(300, 470)
      // Main central taproot
      .lineTo(305, 520)
      .lineTo(295, 565)
      // Left branches
      .moveTo(300, 455).lineTo(265, 480).lineTo(250, 520)
      .moveTo(265, 480).lineTo(275, 510)
      .moveTo(300, 480).lineTo(270, 525).lineTo(260, 550)
      // Right branches
      .moveTo(300, 460).lineTo(340, 485).lineTo(350, 530)
      .moveTo(340, 485).lineTo(325, 515)
      .moveTo(305, 500).lineTo(335, 535).lineTo(340, 560);

    const rootsPath = new Path(rootsShape, {
      stroke: '#d97706',
      lineWidth: 2.5,
      lineCap: 'round',
      lineJoin: 'round'
    });
    parent.addChild(rootsPath);
  }

  private updatePlantWilting(): void {
    const water = this.model.waterLevelProperty.value;
    const isWilted = water < 25;
    const wiltFactor = Math.max(0, (25 - water) / 25); // 0 (healthy) to 1 (fully wilted)

    // Stem: slightly bends if wilted
    const stemShape = new Shape()
      .moveTo(300, 435)
      .quadraticCurveTo(300 + wiltFactor * 25, 340, 300 + wiltFactor * 35, 230);
    this.stemPath.shape = stemShape;
    this.stemPath.stroke = isWilted ? '#65a30d' : '#15803d';

    // Redraw leaves
    this.leavesLayer.removeAllChildren();

    // 5 leaves at varying heights
    const leafConfigs = [
      { stemY: 380, isLeft: true, baseAngle: -35, length: 75, wiltDroop: 40 },
      { stemY: 350, isLeft: false, baseAngle: 30, length: 80, wiltDroop: 45 },
      { stemY: 300, isLeft: true, baseAngle: -45, length: 70, wiltDroop: 50 },
      { stemY: 270, isLeft: false, baseAngle: 40, length: 65, wiltDroop: 45 },
      { stemY: 230, isLeft: true, baseAngle: -15, length: 55, wiltDroop: 35 },
      { stemY: 230, isLeft: false, baseAngle: 15, length: 55, wiltDroop: 35 }
    ];

    const leafColor = isWilted ? '#84cc16' : '#22c55e';
    const leafStroke = isWilted ? '#4d7c0f' : '#16a34a';

    for (const cfg of leafConfigs) {
      const stemX = 300 + wiltFactor * ((435 - cfg.stemY) / 205) * 35;
      const droop = wiltFactor * cfg.wiltDroop;

      const leafShape = new Shape();
      const dir = cfg.isLeft ? -1 : 1;
      const endX = stemX + dir * cfg.length;
      const endY = cfg.stemY + cfg.baseAngle + droop;

      // Leaf blade curve
      leafShape
        .moveTo(stemX, cfg.stemY)
        .quadraticCurveTo(stemX + dir * (cfg.length * 0.5), cfg.stemY - 22 + droop * 0.5, endX, endY)
        .quadraticCurveTo(stemX + dir * (cfg.length * 0.5), cfg.stemY + 22 + droop * 0.8, stemX, cfg.stemY)
        .close();

      const leafPath = new Path(leafShape, {
        fill: leafColor,
        stroke: leafStroke,
        lineWidth: 2
      });
      this.leavesLayer.addChild(leafPath);

      // Leaf center vein
      const veinShape = new Shape()
        .moveTo(stemX, cfg.stemY)
        .quadraticCurveTo(stemX + dir * (cfg.length * 0.5), cfg.stemY + droop * 0.6, endX, endY);
      const veinPath = new Path(veinShape, {
        stroke: leafStroke,
        lineWidth: 1.5
      });
      this.leavesLayer.addChild(veinPath);
    }
  }

  private updateSunAppearance(): void {
    const light = this.model.lightIntensityProperty.value;
    const wavelength = this.model.lightWavelengthProperty.value;

    let baseColor = '#fbbf24';
    let coronaColor = 'rgba(251, 191, 36, 0.25)';
    let strokeColor = '#fef08a';

    if (wavelength === 'blue') {
      baseColor = '#38bdf8';
      coronaColor = 'rgba(56, 189, 248, 0.3)';
      strokeColor = '#bae6fd';
    } else if (wavelength === 'red') {
      baseColor = '#f87171';
      coronaColor = 'rgba(248, 113, 113, 0.3)';
      strokeColor = '#fecaca';
    } else if (wavelength === 'green') {
      baseColor = '#4ade80';
      coronaColor = 'rgba(74, 222, 128, 0.3)';
      strokeColor = '#bbf7d0';
    }

    // Brightness scales with light intensity
    const intensityScale = light / 100;
    this.sunNode.opacity = Math.max(0.15, intensityScale);
    this.sunCorona.radius = 40 + intensityScale * 25;
    this.sunBody.fill = baseColor;
    this.sunBody.stroke = strokeColor;
    this.sunCorona.fill = coronaColor;
  }

  private updateStomata(openness: number): void {
    const gap = openness * 14; // pore opening width
    const isClosed = openness < 0.2;

    // Left guard cell shape (kidney bean)
    const leftShape = new Shape()
      .moveTo(-gap / 2, -35)
      .cubicCurveTo(-35, -35, -35, 35, -gap / 2, 35)
      .cubicCurveTo(-gap / 2 - 12, 18, -gap / 2 - 12, -18, -gap / 2, -35)
      .close();
    this.stomataGuardLeft.shape = leftShape;

    // Right guard cell shape (mirrored)
    const rightShape = new Shape()
      .moveTo(gap / 2, -35)
      .cubicCurveTo(35, -35, 35, 35, gap / 2, 35)
      .cubicCurveTo(gap / 2 + 12, 18, gap / 2 + 12, -18, gap / 2, -35)
      .close();
    this.stomataGuardRight.shape = rightShape;

    // Pore shape
    const poreShape = new Shape()
      .moveTo(-gap / 2, -30)
      .quadraticCurveTo(-gap * 0.9, 0, -gap / 2, 30)
      .lineTo(gap / 2, 30)
      .quadraticCurveTo(gap * 0.9, 0, gap / 2, -30)
      .close();
    this.stomataPore.shape = poreShape;

    if (isClosed) {
      this.stomataStatusText.string = 'Closed (Dehydrated)';
      this.stomataStatusText.fill = '#f87171';
      this.stomataGuardLeft.fill = '#ca8a04';
      this.stomataGuardRight.fill = '#ca8a04';
    } else {
      this.stomataStatusText.string = `Open (${Math.round(openness * 100)}% Turgid)`;
      this.stomataStatusText.fill = '#34d399';
      this.stomataGuardLeft.fill = '#16a34a';
      this.stomataGuardRight.fill = '#16a34a';
    }
    this.stomataStatusText.centerX = 0;
  }

  private updateRateDisplay(rate: number): void {
    const barWidth = Math.max(0, Math.min(110, (rate / 100) * 110));
    this.rateMeterBar.rectWidth = barWidth;

    if (rate > 70) {
      this.rateMeterBar.fill = '#22c55e'; // Vibrant green
    } else if (rate > 35) {
      this.rateMeterBar.fill = '#eab308'; // Amber
    } else {
      this.rateMeterBar.fill = '#ef4444'; // Red
    }

    this.rateMeterText.string = `${Math.round(rate)} %`;

    // Update banner
    const factor = this.model.limitingFactorProperty.value;
    this.statusBannerText.string = factor.includes('Optimal') ? '✨ Photosynthesis Optimal' : `Limiting Factor: ${factor}`;
    this.statusBannerText.centerX = 0;

    if (factor.includes('Optimal')) {
      this.statusBannerBg.fill = '#064e3b';
      this.statusBannerBg.stroke = '#10b981';
    } else if (factor.includes('deficit') || factor.includes('denaturing')) {
      this.statusBannerBg.fill = '#7f1d1d';
      this.statusBannerBg.stroke = '#ef4444';
    } else {
      this.statusBannerBg.fill = '#78350f';
      this.statusBannerBg.stroke = '#f59e0b';
    }
  }

  stepView(): void {
    // 1. Update text accumulators
    this.glucoseText.string = `Glucose: ${this.model.glucoseTotalProperty.value.toFixed(1)} mg`;
    this.oxygenText.string = `Oxygen: ${this.model.oxygenTotalProperty.value.toFixed(1)} mL`;

    // 2. Render particles
    this.particlesLayer.removeAllChildren();

    for (const p of this.model.macroParticles) {
      let particleNode: Node;

      if (p.type === 'photon') {
        particleNode = new Circle(p.size || 4, {
          fill: p.color || '#fbbf24',
          x: p.x,
          y: p.y
        });
      } else if (p.type === 'water') {
        particleNode = new Circle(p.size || 4, {
          fill: '#38bdf8',
          stroke: '#0284c7',
          lineWidth: 1,
          x: p.x,
          y: p.y
        });
      } else if (p.type === 'co2') {
        particleNode = new Node({ x: p.x, y: p.y });
        // Carbon atom in center, 2 oxygens on sides
        const cAtom = new Circle(4, { fill: '#475569' });
        const oAtom1 = new Circle(3, { fill: '#dc2626', x: -6 });
        const oAtom2 = new Circle(3, { fill: '#dc2626', x: 6 });
        particleNode.addChild(oAtom1);
        particleNode.addChild(oAtom2);
        particleNode.addChild(cAtom);
      } else if (p.type === 'oxygen') {
        particleNode = new Node({ x: p.x, y: p.y });
        // O2 molecule: two bonded oxygens
        const o1 = new Circle(3.5, { fill: '#38bdf8', stroke: '#0284c7', lineWidth: 1, x: -3 });
        const o2 = new Circle(3.5, { fill: '#38bdf8', stroke: '#0284c7', lineWidth: 1, x: 3 });
        particleNode.addChild(o1);
        particleNode.addChild(o2);
      } else {
        particleNode = new Circle(3, { fill: '#ffffff', x: p.x, y: p.y });
      }

      this.particlesLayer.addChild(particleNode);
    }
  }
}

