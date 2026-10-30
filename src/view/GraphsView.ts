import { Node, Rectangle, Circle, Path, Text, LinearGradient, Font } from 'scenerystack/scenery';
import { Shape } from 'scenerystack/kite';
import { PhotosynthesisModel } from '../model/PhotosynthesisModel.js';

export class GraphsView extends Node {
  private readonly model: PhotosynthesisModel;
  private readonly lightPoint: Circle;
  private readonly co2Point: Circle;
  private readonly tempPoint: Circle;
  private readonly spectrumIndicator: Node;
  private readonly summaryRateText: Text;
  private readonly summaryLimitingText: Text;
  private readonly o2RateText: Text;
  private readonly co2RateText: Text;

  constructor(model: PhotosynthesisModel) {
    super();
    this.model = model;

    const width = 760;
    const height = 600;

    // Background
    const bg = new Rectangle(0, 0, width, height, {
      fill: '#0f172a'
    });
    this.addChild(bg);

    // Title
    const title = new Text('Photosynthesis Kinetics & Action Spectrum', {
      font: new Font({ size: 14, weight: 'bold' }),
      fill: '#f8fafc',
      x: 25,
      y: 20
    });
    this.addChild(title);

    // ==========================================
    // Graph 1: Absorption Spectrum & Action Spectrum (Top Left)
    // ==========================================
    const g1Node = new Node({ x: 25, y: 50 });
    this.addChild(g1Node);

    const g1Box = new Rectangle(0, 0, 345, 230, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 8
    });
    g1Node.addChild(g1Box);

    const g1Title = new Text('Action Spectrum vs Chlorophyll Absorption', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#38bdf8',
      x: 15,
      y: 12
    });
    g1Node.addChild(g1Title);

    // Spectrum gradient bar at bottom of graph
    const spectrumGradient = new LinearGradient(35, 185, 315, 185)
      .addColorStop(0, '#7c3aed')   // 400nm violet
      .addColorStop(0.15, '#2563eb') // 450nm blue
      .addColorStop(0.35, '#06b6d4') // 500nm cyan
      .addColorStop(0.5, '#22c55e')  // 550nm green
      .addColorStop(0.68, '#eab308') // 600nm yellow
      .addColorStop(0.85, '#f97316') // 650nm orange
      .addColorStop(1, '#ef4444');   // 700nm red

    const spectrumBar = new Rectangle(35, 185, 280, 10, {
      fill: spectrumGradient,
      cornerRadius: 3
    });
    g1Node.addChild(spectrumBar);

    // Axes
    const g1Axes = new Path(
      new Shape().moveTo(35, 35).lineTo(35, 185).lineTo(315, 185),
      { stroke: '#64748b', lineWidth: 1.5 }
    );
    g1Node.addChild(g1Axes);

    // Labels
    const wLabel1 = new Text('400nm (Blue)', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 30, y: 200 });
    const wLabel2 = new Text('550nm (Green)', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 145, y: 200 });
    const wLabel3 = new Text('700nm (Red)', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 275, y: 200 });
    g1Node.addChild(wLabel1);
    g1Node.addChild(wLabel2);
    g1Node.addChild(wLabel3);

    // Chlorophyll a curve (Blue peak at 430nm, Red peak at 662nm)
    const chlaShape = new Shape()
      .moveTo(35, 175)
      .quadraticCurveTo(65, 45, 80, 50)     // blue peak
      .quadraticCurveTo(110, 160, 175, 175) // green trough
      .quadraticCurveTo(240, 170, 275, 75)  // red peak
      .quadraticCurveTo(295, 120, 315, 180);
    const chlaPath = new Path(chlaShape, { stroke: '#38bdf8', lineWidth: 2 });
    g1Node.addChild(chlaPath);

    // Action Spectrum curve (Photosynthesis rate)
    const actionShape = new Shape()
      .moveTo(35, 170)
      .quadraticCurveTo(75, 55, 95, 65)
      .quadraticCurveTo(135, 150, 175, 165) // low in green!
      .quadraticCurveTo(225, 145, 270, 80)
      .quadraticCurveTo(295, 130, 315, 175);
    const actionPath = new Path(actionShape, { stroke: '#facc15', lineWidth: 2.5 });
    g1Node.addChild(actionPath);

    // Legend
    const leg1 = new Text('— Chl a absorption', { font: new Font({ size: 9 }), fill: '#38bdf8', x: 180, y: 35 });
    const leg2 = new Text('— Action Spectrum (Rate)', { font: new Font({ size: 9 }), fill: '#facc15', x: 180, y: 50 });
    g1Node.addChild(leg1);
    g1Node.addChild(leg2);

    // Spectrum current wavelength indicator line
    this.spectrumIndicator = new Node({ x: 80, y: 185 });
    const indLine = new Path(new Shape().moveTo(0, -150).lineTo(0, 0), {
      stroke: '#ffffff',
      lineWidth: 2,
      lineDash: [3, 3]
    });
    const indMarker = new Circle(4, { fill: '#ffffff', stroke: '#000000', lineWidth: 1 });
    this.spectrumIndicator.addChild(indLine);
    this.spectrumIndicator.addChild(indMarker);
    g1Node.addChild(this.spectrumIndicator);

    // ==========================================
    // Graph 2: Rate vs Light Intensity (Top Right)
    // ==========================================
    const g2Node = new Node({ x: 390, y: 50 });
    this.addChild(g2Node);

    const g2Box = new Rectangle(0, 0, 345, 230, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 8
    });
    g2Node.addChild(g2Box);

    const g2Title = new Text('Rate vs Light Intensity (Saturation Curve)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#facc15',
      x: 15,
      y: 12
    });
    g2Node.addChild(g2Title);

    const g2Axes = new Path(
      new Shape().moveTo(35, 35).lineTo(35, 185).lineTo(315, 185),
      { stroke: '#64748b', lineWidth: 1.5 }
    );
    g2Node.addChild(g2Axes);

    // Curve: Michaelis-Menten saturation
    const g2Shape = new Shape().moveTo(35, 185);
    for (let x = 35; x <= 315; x += 10) {
      const frac = (x - 35) / 280;
      const rateFrac = frac / (frac + 0.22);
      const y = 185 - rateFrac * 140;
      g2Shape.lineTo(x, y);
    }
    const g2Path = new Path(g2Shape, { stroke: '#fbbf24', lineWidth: 2 });
    g2Node.addChild(g2Path);

    const g2XLabel = new Text('0% Light             50%              100%', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 40, y: 195 });
    const g2YLabel = new Text('Rate %', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 8, y: 30 });
    g2Node.addChild(g2XLabel);
    g2Node.addChild(g2YLabel);

    // Active operating point dot
    this.lightPoint = new Circle(6, { fill: '#38bdf8', stroke: '#ffffff', lineWidth: 2 });
    g2Node.addChild(this.lightPoint);

    // ==========================================
    // Graph 3: Rate vs CO2 Concentration (Bottom Left)
    // ==========================================
    const g3Node = new Node({ x: 25, y: 300 });
    this.addChild(g3Node);

    const g3Box = new Rectangle(0, 0, 345, 190, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 8
    });
    g3Node.addChild(g3Box);

    const g3Title = new Text('Rate vs CO₂ Concentration (ppm)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#cbd5e1',
      x: 15,
      y: 12
    });
    g3Node.addChild(g3Title);

    const g3Axes = new Path(
      new Shape().moveTo(35, 30).lineTo(35, 150).lineTo(315, 150),
      { stroke: '#64748b', lineWidth: 1.5 }
    );
    g3Node.addChild(g3Axes);

    // Curve
    const g3Shape = new Shape().moveTo(35, 150);
    for (let x = 35; x <= 315; x += 10) {
      const co2Val = 100 + ((x - 35) / 280) * 1400;
      const rateFrac = co2Val / (co2Val + 380);
      const y = 150 - rateFrac * 115;
      g3Shape.lineTo(x, y);
    }
    const g3Path = new Path(g3Shape, { stroke: '#94a3b8', lineWidth: 2 });
    g3Node.addChild(g3Path);

    const g3XLabel = new Text('100 ppm            800 ppm            1500 ppm', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 35, y: 160 });
    g3Node.addChild(g3XLabel);

    this.co2Point = new Circle(6, { fill: '#f87171', stroke: '#ffffff', lineWidth: 2 });
    g3Node.addChild(this.co2Point);

    // ==========================================
    // Graph 4: Rate vs Temperature (Bottom Right)
    // ==========================================
    const g4Node = new Node({ x: 390, y: 300 });
    this.addChild(g4Node);

    const g4Box = new Rectangle(0, 0, 345, 190, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 8
    });
    g4Node.addChild(g4Box);

    const g4Title = new Text('Rate vs Temperature (°C) - Thermal Kinetics', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#f87171',
      x: 15,
      y: 12
    });
    g4Node.addChild(g4Title);

    const g4Axes = new Path(
      new Shape().moveTo(35, 30).lineTo(35, 150).lineTo(315, 150),
      { stroke: '#64748b', lineWidth: 1.5 }
    );
    g4Node.addChild(g4Axes);

    // Bell curve: Enzymatic denaturation
    const g4Shape = new Shape().moveTo(35, 148);
    for (let x = 35; x <= 315; x += 10) {
      const tempVal = 5 + ((x - 35) / 280) * 45;
      let fT = 0;
      if (tempVal <= 28) {
        fT = Math.pow((tempVal - 4) / 24, 1.6);
      } else if (tempVal <= 48) {
        const drop = (tempVal - 28) / 20;
        fT = Math.max(0, 1 - Math.pow(drop, 1.8));
      }
      const y = 150 - Math.min(1, Math.max(0, fT)) * 115;
      g4Shape.lineTo(x, y);
    }
    const g4Path = new Path(g4Shape, { stroke: '#ef4444', lineWidth: 2 });
    g4Node.addChild(g4Path);

    const g4XLabel = new Text('5°C          Optimum (28°C)         45°C (Denature)', { font: new Font({ size: 8 }), fill: '#94a3b8', x: 35, y: 160 });
    g4Node.addChild(g4XLabel);

    this.tempPoint = new Circle(6, { fill: '#4ade80', stroke: '#ffffff', lineWidth: 2 });
    g4Node.addChild(this.tempPoint);

    // ==========================================
    // Real-Time Analytics Banner at Bottom
    // ==========================================
    const statsNode = new Node({ x: 25, y: 505 });
    this.addChild(statsNode);

    const statsBg = new Rectangle(0, 0, 710, 80, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 8
    });
    statsNode.addChild(statsBg);

    this.summaryRateText = new Text('Photosynthetic Rate: 75 %', {
      font: new Font({ size: 12, weight: 'bold' }),
      fill: '#22c55e',
      x: 18,
      y: 12
    });
    statsNode.addChild(this.summaryRateText);

    this.summaryLimitingText = new Text('Current Limiting Factor: Near optimal conditions ✨', {
      font: new Font({ size: 11 }),
      fill: '#facc15',
      x: 18,
      y: 35
    });
    statsNode.addChild(this.summaryLimitingText);

    this.o2RateText = new Text('O₂ Evolution Rate: 14.8 μmol / m² / s', {
      font: new Font({ size: 11 }),
      fill: '#38bdf8',
      x: 420,
      y: 12
    });
    statsNode.addChild(this.o2RateText);

    this.co2RateText = new Text('CO₂ Uptake Rate: 15.2 μmol / m² / s', {
      font: new Font({ size: 11 }),
      fill: '#94a3b8',
      x: 420,
      y: 35
    });
    statsNode.addChild(this.co2RateText);

    this.updateGraphPoints();
  }

  updateGraphPoints(): void {
    const light = this.model.lightIntensityProperty.value;
    const wavelength = this.model.lightWavelengthProperty.value;
    const co2 = this.model.co2ConcentrationProperty.value;
    const temp = this.model.temperatureProperty.value;
    const rate = this.model.photosynthesisRateProperty.value;

    // Spectrum indicator position
    if (wavelength === 'blue') {
      this.spectrumIndicator.x = 75; // ~450nm
    } else if (wavelength === 'green') {
      this.spectrumIndicator.x = 155; // ~530nm
    } else if (wavelength === 'red') {
      this.spectrumIndicator.x = 270; // ~660nm
    } else {
      this.spectrumIndicator.x = 175; // white broad
    }

    // Light plot point
    const lx = 35 + (light / 100) * 280;
    const lFrac = (light / 100) / ((light / 100) + 0.22);
    const ly = 185 - lFrac * 140;
    this.lightPoint.x = lx;
    this.lightPoint.y = ly;

    // CO2 plot point
    const cx = 35 + ((co2 - 100) / 1400) * 280;
    const cFrac = co2 / (co2 + 380);
    const cy = 150 - cFrac * 115;
    this.co2Point.x = cx;
    this.co2Point.y = cy;

    // Temp plot point
    const tx = 35 + ((temp - 5) / 40) * 280;
    let fT = 0;
    if (temp <= 28) {
      fT = Math.pow((temp - 4) / 24, 1.6);
    } else if (temp <= 48) {
      const drop = (temp - 28) / 20;
      fT = Math.max(0, 1 - Math.pow(drop, 1.8));
    }
    const ty = 150 - Math.min(1, Math.max(0, fT)) * 115;
    this.tempPoint.x = tx;
    this.tempPoint.y = ty;

    // Summary texts
    this.summaryRateText.string = `Photosynthetic Rate: ${Math.round(rate)} %`;
    this.summaryLimitingText.string = `Current Limiting Factor: ${this.model.limitingFactorProperty.value}`;
    const rateScale = (rate / 100);
    this.o2RateText.string = `O₂ Evolution Rate: ${(rateScale * 18.5).toFixed(1)} μmol / m² / s`;
    this.co2RateText.string = `CO₂ Uptake Rate: ${(rateScale * 19.2).toFixed(1)} μmol / m² / s`;
  }

  stepView(): void {
    this.updateGraphPoints();
  }
}

