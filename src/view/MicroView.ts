import { Node, Rectangle, Circle, Path, Text, RichText, LinearGradient, Font } from 'scenerystack/scenery';
import { Shape } from 'scenerystack/kite';
import { PhotosynthesisModel } from '../model/PhotosynthesisModel.js';

export class MicroView extends Node {
  private readonly model: PhotosynthesisModel;
  private readonly particlesLayer = new Node();
  private readonly atpSynthaseRotorNode: Node;
  private readonly calvinCycleNode: Node;
  private readonly atpRateText: Text;
  private readonly nadphRateText: Text;
  private readonly etcStatusText: Text;
  private readonly atpShuttleNode: Node;
  private readonly nadphShuttleNode: Node;

  constructor(model: PhotosynthesisModel) {
    super();
    this.model = model;

    const width = 760;
    const height = 600;

    // 1. Stroma Background
    const stromaBg = new Rectangle(0, 0, width, height, {
      fill: new LinearGradient(0, 0, width, height)
        .addColorStop(0, '#064e3b')
        .addColorStop(0.5, '#042f2e')
        .addColorStop(1, '#022c22')
    });
    this.addChild(stromaBg);

    // Chloroplast Membrane Outer Outline
    const chloroplastWall = new Rectangle(10, 10, width - 20, height - 20, {
      stroke: '#059669',
      lineWidth: 4,
      cornerRadius: 24
    });
    this.addChild(chloroplastWall);

    const innerMembrane = new Rectangle(16, 16, width - 32, height - 32, {
      stroke: 'rgba(52, 211, 153, 0.4)',
      lineWidth: 2,
      cornerRadius: 20
    });
    this.addChild(innerMembrane);

    // Title & Region Headers
    const titleText = new Text('Chloroplast: Molecular Machinery', {
      font: new Font({ size: 14, weight: 'bold' }),
      fill: '#a7f3d0',
      x: 30,
      y: 25
    });
    this.addChild(titleText);

    const lightRxnHeader = new Text('LIGHT-DEPENDENT REACTIONS (Thylakoid)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#38bdf8',
      x: 30,
      y: 60
    });
    this.addChild(lightRxnHeader);

    const calvinRxnHeader = new Text('LIGHT-INDEPENDENT REACTIONS (Calvin Cycle / Stroma)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#fbbf24',
      x: 430,
      y: 60
    });
    this.addChild(calvinRxnHeader);

    // 2. Thylakoid Membrane & Lumen
    const thylakoidLumen = new Rectangle(25, 230, 380, 140, {
      fill: '#0f766e',
      stroke: '#14b8a6',
      lineWidth: 3,
      cornerRadius: 16
    });
    this.addChild(thylakoidLumen);

    const lumenLabel = new Text('Thylakoid Lumen (High H⁺ / Acidic)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#99f6e4',
      x: 35,
      y: 340
    });
    this.addChild(lumenLabel);

    const stromaLabel = new Text('Stroma Fluid (pH ~8.0)', {
      font: new Font({ size: 11, weight: 'bold' }),
      fill: '#6ee7b7',
      x: 35,
      y: 195
    });
    this.addChild(stromaLabel);

    // Thylakoid Membrane Bilayer representation
    const bilayer = new Rectangle(25, 215, 380, 25, {
      fill: '#0d9488',
      stroke: '#2dd4bf',
      lineWidth: 1.5,
      cornerRadius: 4
    });
    this.addChild(bilayer);

    // 3. Photosystem II (PS II / P680)
    const ps2Node = new Node({ x: 75, y: 195 });
    this.addChild(ps2Node);
    const ps2Body = new Rectangle(0, 0, 55, 60, {
      fill: '#15803d',
      stroke: '#4ade80',
      lineWidth: 2,
      cornerRadius: 8
    });
    ps2Node.addChild(ps2Body);
    const ps2Text = new Text('PS II\n(P680)', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 27,
      centerY: 28
    });
    ps2Node.addChild(ps2Text);

    // Photolysis label under PS II
    const photolysisText = new RichText(
      '<span style="color:#67e8f9">2H<sub>2</sub>O</span> &rarr; ' +
      '<span style="color:#ec4899">4H<sup>+</sup></span> + ' +
      '<span style="color:#facc15">4e<sup>-</sup></span> + ' +
      '<span style="color:#38bdf8">O<sub>2</sub>&uarr;</span>',
      {
        font: new Font({ size: 9, weight: 'bold' }),
        x: 40,
        y: 275
      }
    );
    this.addChild(photolysisText);

    // 4. Plastoquinone & Cytochrome b6f Complex
    const b6fNode = new Node({ x: 155, y: 200 });
    this.addChild(b6fNode);
    const b6fBody = new Rectangle(0, 0, 50, 50, {
      fill: '#0369a1',
      stroke: '#38bdf8',
      lineWidth: 2,
      cornerRadius: 8
    });
    b6fNode.addChild(b6fBody);
    const b6fText = new Text('Cyt\nb₆f', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 25,
      centerY: 25
    });
    b6fNode.addChild(b6fText);

    // Proton pumping arrow through Cyt b6f
    const pumpArrow = new Path(
      new Shape().moveTo(180, 185).lineTo(180, 270),
      { stroke: '#ec4899', lineWidth: 2, lineDash: [3, 3] }
    );
    this.addChild(pumpArrow);
    const pumpLabel = new Text('H⁺ pump', {
      font: new Font({ size: 9 }),
      fill: '#f472b6',
      x: 185,
      y: 175
    });
    this.addChild(pumpLabel);

    // 5. Photosystem I (PS I / P700)
    const ps1Node = new Node({ x: 230, y: 195 });
    this.addChild(ps1Node);
    const ps1Body = new Rectangle(0, 0, 55, 60, {
      fill: '#15803d',
      stroke: '#4ade80',
      lineWidth: 2,
      cornerRadius: 8
    });
    ps1Node.addChild(ps1Body);
    const ps1Text = new Text('PS I\n(P700)', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 27,
      centerY: 28
    });
    ps1Node.addChild(ps1Text);

    // 6. Ferredoxin & NADP+ Reductase
    const nrNode = new Node({ x: 305, y: 185 });
    this.addChild(nrNode);
    const nrBody = new Rectangle(0, 0, 40, 45, {
      fill: '#7c3aed',
      stroke: '#a78bfa',
      lineWidth: 2,
      cornerRadius: 6
    });
    nrNode.addChild(nrBody);
    const nrText = new Text('NADP⁺\nRed.', {
      font: new Font({ size: 8, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 20,
      centerY: 22
    });
    nrNode.addChild(nrText);

    // NADPH product label
    const nadphProdText = new RichText('NADP⁺ &rarr; <span style="color:#fbbf24">NADPH</span>', {
      font: new Font({ size: 9, weight: 'bold' }),
      x: 295,
      y: 165
    });
    this.addChild(nadphProdText);

    // 7. ATP Synthase Complex
    const atpSynthaseNode = new Node({ x: 370, y: 225 });
    this.addChild(atpSynthaseNode);

    // Membrane base (F0)
    const f0Base = new Rectangle(-16, -15, 32, 30, {
      fill: '#b45309',
      stroke: '#f59e0b',
      lineWidth: 2,
      cornerRadius: 4
    });
    atpSynthaseNode.addChild(f0Base);

    // Stalk
    const stalk = new Rectangle(-6, -35, 12, 22, {
      fill: '#d97706'
    });
    atpSynthaseNode.addChild(stalk);

    // F1 head (rotates!)
    this.atpSynthaseRotorNode = new Node({ y: -45 });
    atpSynthaseNode.addChild(this.atpSynthaseRotorNode);

    const f1Head = new Circle(20, {
      fill: '#f59e0b',
      stroke: '#fde68a',
      lineWidth: 2
    });
    this.atpSynthaseRotorNode.addChild(f1Head);

    // Turbine rotor blades
    for (let i = 0; i < 3; i++) {
      const blade = new Path(
        new Shape().moveTo(0, 0).lineTo(Math.cos(i * 2.09) * 15, Math.sin(i * 2.09) * 15),
        { stroke: '#78350f', lineWidth: 3, lineCap: 'round' }
      );
      this.atpSynthaseRotorNode.addChild(blade);
    }

    const atpSynthaseLabel = new Text('ATP\nSynthase', {
      font: new Font({ size: 8, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 0,
      y: -75
    });
    atpSynthaseNode.addChild(atpSynthaseLabel);

    const atpProdText = new RichText('ADP + P<sub>i</sub> &rarr; <span style="color:#fbbf24">ATP</span>', {
      font: new Font({ size: 9, weight: 'bold' }),
      x: 330,
      y: 135
    });
    this.addChild(atpProdText);

    // 8. Calvin-Benson Cycle (Right Side)
    const calvinCenter = new Node({ x: 575, y: 280 });
    this.addChild(calvinCenter);

    // Outer orbit ring
    const cycleOrbit = new Circle(105, {
      stroke: 'rgba(251, 191, 36, 0.4)',
      lineWidth: 3,
      lineDash: [8, 6]
    });
    calvinCenter.addChild(cycleOrbit);

    // Center RuBisCO Enzyme Node
    const rubiscoCenter = new Circle(38, {
      fill: '#b91c1c',
      stroke: '#f87171',
      lineWidth: 3
    });
    calvinCenter.addChild(rubiscoCenter);

    const rubiscoText = new Text('RuBisCO\nEnzyme', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#ffffff',
      centerX: 0,
      centerY: 0
    });
    calvinCenter.addChild(rubiscoText);

    // Rotating stages of Calvin cycle
    this.calvinCycleNode = new Node();
    calvinCenter.addChild(this.calvinCycleNode);

    // 4 Key Metabolic Intermediates placed in orbit
    const stageNodes = [
      { label: 'CO₂ Fixation\n(RuBP + CO₂)', angle: -Math.PI / 2, color: '#38bdf8' },
      { label: '3-PGA\n(Reduction)', angle: 0, color: '#f59e0b' },
      { label: 'G3P Output\n&rarr; Glucose', angle: Math.PI / 2, color: '#22c55e' },
      { label: 'RuBP Regen.\n(Uses ATP)', angle: Math.PI, color: '#ec4899' }
    ];

    for (const stg of stageNodes) {
      const sx = Math.cos(stg.angle) * 105;
      const sy = Math.sin(stg.angle) * 105;

      const badge = new Rectangle(sx - 42, sy - 18, 84, 36, {
        fill: '#1e293b',
        stroke: stg.color,
        lineWidth: 2,
        cornerRadius: 6
      });
      this.calvinCycleNode.addChild(badge);

      const stgText = new Text(stg.label, {
        font: new Font({ size: 9, weight: 'bold' }),
        fill: '#ffffff',
        centerX: sx,
        centerY: sy
      });
      this.calvinCycleNode.addChild(stgText);
    }

    // 9. Glucose Product Outlet from Calvin Cycle
    const glucoseOutlet = new Node({ x: 575, y: 440 });
    this.addChild(glucoseOutlet);

    const glucoseBox = new Rectangle(-70, 0, 140, 36, {
      fill: '#78350f',
      stroke: '#f59e0b',
      lineWidth: 2,
      cornerRadius: 6
    });
    glucoseOutlet.addChild(glucoseBox);

    const glucoseOutText = new RichText(
      '<span style="color:#fef08a">Glucose Output</span>: ' +
      '<span style="color:#ffffff">C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span>',
      {
        font: new Font({ size: 10, weight: 'bold' }),
        centerX: 0,
        centerY: 18
      }
    );
    glucoseOutlet.addChild(glucoseOutText);

    // 10. Energy Carrier Shuttles (Between Thylakoid & Calvin Cycle)
    this.atpShuttleNode = new Node({ x: 420, y: 155 });
    this.addChild(this.atpShuttleNode);
    const atpBadge = new Rectangle(0, 0, 80, 22, {
      fill: '#854d0e',
      stroke: '#facc15',
      lineWidth: 1.5,
      cornerRadius: 11
    });
    this.atpShuttleNode.addChild(atpBadge);
    const atpBadgeText = new Text('⚡ ATP &rarr;', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#fef08a',
      centerX: 40,
      centerY: 11
    });
    this.atpShuttleNode.addChild(atpBadgeText);

    this.nadphShuttleNode = new Node({ x: 420, y: 390 });
    this.addChild(this.nadphShuttleNode);
    const nadphBadge = new Rectangle(0, 0, 80, 22, {
      fill: '#581c87',
      stroke: '#c084fc',
      lineWidth: 1.5,
      cornerRadius: 11
    });
    this.nadphShuttleNode.addChild(nadphBadge);
    const nadphBadgeText = new Text('⚡ NADPH &rarr;', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#f3e8ff',
      centerX: 40,
      centerY: 11
    });
    this.nadphShuttleNode.addChild(nadphBadgeText);

    // 11. Real-time Status Panel at bottom
    const infoPanel = new Node({ x: 25, y: 490 });
    this.addChild(infoPanel);

    const infoBg = new Rectangle(0, 0, 710, 85, {
      fill: 'rgba(15, 23, 42, 0.95)',
      stroke: '#334155',
      cornerRadius: 8,
      lineWidth: 1.5
    });
    infoPanel.addChild(infoBg);

    this.etcStatusText = new Text('Electron Transport Chain: Active (Photons absorbed)', {
      font: new Font({ size: 12, weight: 'bold' }),
      fill: '#38bdf8',
      x: 18,
      y: 12
    });
    infoPanel.addChild(this.etcStatusText);

    this.atpRateText = new Text('ATP Synthesis Rate: 100 % (Proton Motive Force High)', {
      font: new Font({ size: 11 }),
      fill: '#fbbf24',
      x: 18,
      y: 36
    });
    infoPanel.addChild(this.atpRateText);

    this.nadphRateText = new Text('NADPH Synthesis Rate: 100 % | RuBisCO Affinity: High', {
      font: new Font({ size: 11 }),
      fill: '#c084fc',
      x: 18,
      y: 58
    });
    infoPanel.addChild(this.nadphRateText);

    // Particles layer for electrons & protons
    this.addChild(this.particlesLayer);

    this.model.photosynthesisRateProperty.link(rate => this.updateMicroStatus(rate));
  }

  private updateMicroStatus(rate: number): void {
    const light = this.model.lightIntensityProperty.value;
    const co2 = this.model.co2ConcentrationProperty.value;

    if (light < 5) {
      this.etcStatusText.string = 'ETC Status: Inactive (Darkness — No photon energy for PS II)';
      this.etcStatusText.fill = '#94a3b8';
    } else {
      this.etcStatusText.string = `ETC Status: Active (${Math.round(rate)}% throughput, Photolysis operating)`;
      this.etcStatusText.fill = '#38bdf8';
    }

    this.atpRateText.string = `ATP Synthesis Rate: ${Math.round(rate)} % | Proton gradient (ΔpH): ${rate > 40 ? 'High' : 'Low'}`;
    this.nadphRateText.string = `NADPH Synthesis Rate: ${Math.round(rate)} % | RuBisCO CO₂ Fixation: ${co2 > 400 ? 'Active' : 'Starved'}`;
  }

  stepView(): void {
    // 1. Rotate ATP Synthase F1 rotor
    this.atpSynthaseRotorNode.rotation = this.model.atpSynthaseAngleProperty.value;

    // 2. Rotate Calvin cycle orbit
    this.calvinCycleNode.rotation = this.model.calvinCycleAngleProperty.value;

    // 3. Render micro particles (protons, electrons)
    this.particlesLayer.removeAllChildren();

    for (const p of this.model.microParticles) {
      const pNode = new Circle(p.size || 3.5, {
        fill: p.color || '#facc15',
        stroke: '#ffffff',
        lineWidth: 0.5,
        x: p.x,
        y: p.y
      });
      this.particlesLayer.addChild(pNode);
    }
  }
}

