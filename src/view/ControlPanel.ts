import { Node, Text, Rectangle, Circle, HBox, VBox, Font, FlowBox } from 'scenerystack/scenery';
import { Shape } from 'scenerystack/kite';
import { TextPushButton, RectangularPushButton, RoundPushButton, HSlider, Checkbox, Panel } from 'scenerystack/sun';
import { Range, Dimension2 } from 'scenerystack/dot';
import { DerivedProperty } from 'scenerystack/axon';
import { PhotosynthesisModel, LightWavelength } from '../model/PhotosynthesisModel.js';

export class ControlPanel extends Node {
  private readonly model: PhotosynthesisModel;

  constructor(model: PhotosynthesisModel) {
    super();
    this.model = model;

    const sections: Node[] = [];

    // ==========================================
    // Section 1: Playback & Primary Controls (Sun UI Buttons)
    // ==========================================
    const playPauseTextProperty = new DerivedProperty(
      [model.isPlayingProperty],
      isPlaying => isPlaying ? '⏸ Pause' : '▶ Play'
    );

    const playPauseBtn = new TextPushButton(
      playPauseTextProperty,
      {
        font: new Font({ size: 11, weight: 'bold' }),
        baseColor: '#0284c7',
        textFill: '#ffffff',
        xMargin: 10,
        yMargin: 6,
        listener: () => {
          model.isPlayingProperty.value = !model.isPlayingProperty.value;
        }
      }
    );

    const stepBtn = new TextPushButton('⏭ Step', {
      font: new Font({ size: 11, weight: 'bold' }),
      baseColor: '#334155',
      textFill: '#f8fafc',
      xMargin: 8,
      yMargin: 6,
      listener: () => {
        model.isPlayingProperty.value = false;
        model.step(0.1);
      }
    });

    const resetBtn = new TextPushButton('🔄 Reset', {
      font: new Font({ size: 11, weight: 'bold' }),
      baseColor: '#dc2626',
      textFill: '#ffffff',
      xMargin: 8,
      yMargin: 6,
      listener: () => {
        model.resetAll();
      }
    });

    const playbackRow = new HBox({
      spacing: 6,
      children: [playPauseBtn, stepBtn, resetBtn]
    });
    sections.push(playbackRow);

    // ==========================================
    // Section 2: Quick Actions (Sun UI Buttons)
    // ==========================================
    const waterBtn = new TextPushButton('💧 Water Plant (+35%)', {
      font: new Font({ size: 10, weight: 'bold' }),
      baseColor: '#2563eb',
      textFill: '#ffffff',
      xMargin: 8,
      yMargin: 5,
      listener: () => model.waterPlant()
    });

    const co2Btn = new TextPushButton('💨 CO₂ Pulse (+300ppm)', {
      font: new Font({ size: 10, weight: 'bold' }),
      baseColor: '#475569',
      textFill: '#ffffff',
      xMargin: 8,
      yMargin: 5,
      listener: () => model.injectCO2()
    });

    const actionsRow = new HBox({
      spacing: 6,
      children: [waterBtn, co2Btn]
    });
    sections.push(actionsRow);

    // ==========================================
    // Section 3: Sliders (Sun UI HSlider)
    // ==========================================
    // 1. Light Intensity Slider
    const lightLabelNode = new Text('Light Intensity: 75%', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#fbbf24'
    });
    model.lightIntensityProperty.link(v => {
      lightLabelNode.string = `Light Intensity: ${Math.round(v)}%`;
    });

    const lightSlider = new HSlider(model.lightIntensityProperty, new Range(0, 100), {
      trackSize: new Dimension2(185, 4),
      thumbSize: new Dimension2(14, 22),
      thumbFill: '#fbbf24'
    });
    lightSlider.addMajorTick(0, new Text('0', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    lightSlider.addMajorTick(50, new Text('50', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    lightSlider.addMajorTick(100, new Text('100', { font: new Font({ size: 8 }), fill: '#94a3b8' }));

    const lightBox = new VBox({
      align: 'left',
      spacing: 4,
      children: [lightLabelNode, lightSlider]
    });

    // 2. Light Wavelength Selectors (Sun UI RectangularPushButton)
    const waveHeader = new Text('Light Spectrum (Wavelength):', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#cbd5e1'
    });

    const makeSpectrumBtn = (label: string, wave: LightWavelength, color: string) => {
      return new TextPushButton(label, {
        font: new Font({ size: 9, weight: 'bold' }),
        baseColor: color,
        textFill: '#ffffff',
        xMargin: 6,
        yMargin: 4,
        listener: () => {
          model.lightWavelengthProperty.value = wave;
        }
      });
    };

    const whiteBtn = makeSpectrumBtn('White (Sun)', 'white', '#d97706');
    const blueBtn = makeSpectrumBtn('Blue (450nm)', 'blue', '#0284c7');
    const redBtn = makeSpectrumBtn('Red (660nm)', 'red', '#dc2626');
    const greenBtn = makeSpectrumBtn('Green (530nm)', 'green', '#16a34a');

    const spectrumRow = new FlowBox({
      spacing: 4,
      lineSpacing: 4,
      children: [whiteBtn, blueBtn, redBtn, greenBtn]
    });

    const spectrumBox = new VBox({
      align: 'left',
      spacing: 4,
      children: [waveHeader, spectrumRow]
    });

    // 3. CO2 Concentration Slider
    const co2LabelNode = new Text('CO₂ Concentration: 450 ppm', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#cbd5e1'
    });
    model.co2ConcentrationProperty.link(v => {
      co2LabelNode.string = `CO₂ Concentration: ${Math.round(v)} ppm`;
    });

    const co2Slider = new HSlider(model.co2ConcentrationProperty, new Range(100, 1500), {
      trackSize: new Dimension2(185, 4),
      thumbSize: new Dimension2(14, 22),
      thumbFill: '#94a3b8'
    });
    co2Slider.addMajorTick(100, new Text('100', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    co2Slider.addMajorTick(800, new Text('800', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    co2Slider.addMajorTick(1500, new Text('1500', { font: new Font({ size: 8 }), fill: '#94a3b8' }));

    const co2Box = new VBox({
      align: 'left',
      spacing: 4,
      children: [co2LabelNode, co2Slider]
    });

    // 4. Water Availability Slider
    const waterLabelNode = new Text('Water Level: 70%', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#60a5fa'
    });
    model.waterLevelProperty.link(v => {
      waterLabelNode.string = `Water Level: ${Math.round(v)}% (Soil Moisture)`;
    });

    const waterSlider = new HSlider(model.waterLevelProperty, new Range(0, 100), {
      trackSize: new Dimension2(185, 4),
      thumbSize: new Dimension2(14, 22),
      thumbFill: '#3b82f6'
    });
    waterSlider.addMajorTick(0, new Text('0', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    waterSlider.addMajorTick(50, new Text('50', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    waterSlider.addMajorTick(100, new Text('100', { font: new Font({ size: 8 }), fill: '#94a3b8' }));

    const waterBox = new VBox({
      align: 'left',
      spacing: 4,
      children: [waterLabelNode, waterSlider]
    });

    // 5. Temperature Slider
    const tempLabelNode = new Text('Temperature: 25 °C', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#f87171'
    });
    model.temperatureProperty.link(v => {
      tempLabelNode.string = `Temperature: ${Math.round(v)} °C`;
    });

    const tempSlider = new HSlider(model.temperatureProperty, new Range(5, 45), {
      trackSize: new Dimension2(185, 4),
      thumbSize: new Dimension2(14, 22),
      thumbFill: '#ef4444'
    });
    tempSlider.addMajorTick(5, new Text('5°', { font: new Font({ size: 8 }), fill: '#94a3b8' }));
    tempSlider.addMajorTick(28, new Text('28° (Opt)', { font: new Font({ size: 8 }), fill: '#4ade80' }));
    tempSlider.addMajorTick(45, new Text('45°', { font: new Font({ size: 8 }), fill: '#94a3b8' }));

    const tempBox = new VBox({
      align: 'left',
      spacing: 4,
      children: [tempLabelNode, tempSlider]
    });

    const slidersGroup = new VBox({
      align: 'left',
      spacing: 10,
      children: [lightBox, spectrumBox, co2Box, waterBox, tempBox]
    });
    sections.push(slidersGroup);

    // ==========================================
    // Section 4: Preset Scenarios (Sun UI TextPushButtons)
    // ==========================================
    const presetHeader = new Text('Preset Scenarios:', {
      font: new Font({ size: 10, weight: 'bold' }),
      fill: '#94a3b8'
    });

    const p1 = new TextPushButton('☀️ Sunny Garden', {
      font: new Font({ size: 9 }),
      baseColor: '#065f46',
      textFill: '#ffffff',
      xMargin: 5,
      yMargin: 3,
      listener: () => model.applyOptimalPreset()
    });

    const p2 = new TextPushButton('🌵 Desert Drought', {
      font: new Font({ size: 9 }),
      baseColor: '#9a3412',
      textFill: '#ffffff',
      xMargin: 5,
      yMargin: 3,
      listener: () => model.applyDroughtPreset()
    });

    const p3 = new TextPushButton('🟢 Green Filter', {
      font: new Font({ size: 9 }),
      baseColor: '#166534',
      textFill: '#ffffff',
      xMargin: 5,
      yMargin: 3,
      listener: () => model.applyGreenFilterPreset()
    });

    const p4 = new TextPushButton('🏠 Greenhouse', {
      font: new Font({ size: 9 }),
      baseColor: '#0e7490',
      textFill: '#ffffff',
      xMargin: 5,
      yMargin: 3,
      listener: () => model.applyGreenhousePreset()
    });

    const p5 = new TextPushButton('🌙 Night / Dark', {
      font: new Font({ size: 9 }),
      baseColor: '#334155',
      textFill: '#ffffff',
      xMargin: 5,
      yMargin: 3,
      listener: () => model.applyNightPreset()
    });

    const presetsRow = new FlowBox({
      spacing: 4,
      lineSpacing: 4,
      children: [p1, p2, p3, p4, p5]
    });

    const presetsBox = new VBox({
      align: 'left',
      spacing: 4,
      children: [presetHeader, presetsRow]
    });
    sections.push(presetsBox);

    // ==========================================
    // Section 5: Checkboxes (Sun UI Checkbox)
    // ==========================================
    const cb1 = new Checkbox(
      model.showPhotonsProperty,
      new Text('Show Photons & Molecules', { font: new Font({ size: 10 }), fill: '#cbd5e1' }),
      { boxWidth: 14 }
    );

    const cb2 = new Checkbox(
      model.showElectronsProperty,
      new Text('Show Electron Transport (ETC)', { font: new Font({ size: 10 }), fill: '#cbd5e1' }),
      { boxWidth: 14 }
    );

    const cbGroup = new VBox({
      align: 'left',
      spacing: 5,
      children: [cb1, cb2]
    });
    sections.push(cbGroup);

    // Put everything inside a Sun UI Panel
    const containerVBox = new VBox({
      align: 'left',
      spacing: 12,
      children: sections
    });

    const panel = new Panel(containerVBox, {
      fill: '#1e293b',
      stroke: '#334155',
      lineWidth: 1.5,
      cornerRadius: 10,
      xMargin: 12,
      yMargin: 12,
      minWidth: 260
    });

    this.addChild(panel);
  }
}

