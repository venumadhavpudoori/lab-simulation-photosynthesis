import { Display, Node, Rectangle, Text, HBox, VBox, Font } from 'scenerystack/scenery';
import { TextPushButton, Panel } from 'scenerystack/sun';
import { PhotosynthesisModel } from './model/PhotosynthesisModel.js';
import { MacroView } from './view/MacroView.js';
import { MicroView } from './view/MicroView.js';
import { GraphsView } from './view/GraphsView.js';
import { ControlPanel } from './view/ControlPanel.js';

// 1. Create Model
const model = new PhotosynthesisModel();

// 2. Scene Graph Root
const rootNode = new Node();

// Master container with fixed layout bounds: 1080 x 680
const masterContainer = new Node();
rootNode.addChild(masterContainer);

// Simulation Views
const macroView = new MacroView(model);
const microView = new MicroView(model);
const graphsView = new GraphsView(model);

// View switch container
const viewContainer = new Node({ x: 20, y: 65 });
viewContainer.addChild(macroView);
viewContainer.addChild(microView);
viewContainer.addChild(graphsView);
masterContainer.addChild(viewContainer);

// Control Panel on Right
const controlPanel = new ControlPanel(model);
controlPanel.x = 795;
controlPanel.y = 65;
masterContainer.addChild(controlPanel);

// 3. Top Navigation Bar (Sun UI Buttons)
const navBar = new Node({ x: 20, y: 15 });
masterContainer.addChild(navBar);

const titleText = new Text('Photosynthesis Interactive Simulation', {
  font: new Font({ size: 16, weight: 'bold' }),
  fill: '#38bdf8',
  centerY: 18
});
navBar.addChild(titleText);

// Tab Buttons using Sun UI TextPushButton
const macroBtn = new TextPushButton('🌿 Plant & Environment', {
  font: new Font({ size: 11, weight: 'bold' }),
  baseColor: '#059669',
  textFill: '#ffffff',
  xMargin: 12,
  yMargin: 8,
  listener: () => {
    model.activeTabProperty.value = 'macro';
  }
});

const microBtn = new TextPushButton('🔬 Chloroplast & ETC', {
  font: new Font({ size: 11, weight: 'bold' }),
  baseColor: '#334155',
  textFill: '#cbd5e1',
  xMargin: 12,
  yMargin: 8,
  listener: () => {
    model.activeTabProperty.value = 'micro';
  }
});

const graphsBtn = new TextPushButton('📊 Graphs & Spectrum', {
  font: new Font({ size: 11, weight: 'bold' }),
  baseColor: '#334155',
  textFill: '#cbd5e1',
  xMargin: 12,
  yMargin: 8,
  listener: () => {
    model.activeTabProperty.value = 'graphs';
  }
});

const tabsBox = new HBox({
  x: 350,
  centerY: 18,
  spacing: 8,
  children: [macroBtn, microBtn, graphsBtn]
});
navBar.addChild(tabsBox);

// Sync Tab Button styles and View visibility
model.activeTabProperty.link(tab => {
  macroView.visible = tab === 'macro';
  microView.visible = tab === 'micro';
  graphsView.visible = tab === 'graphs';

  macroBtn.baseColor = tab === 'macro' ? '#059669' : '#334155';
  microBtn.baseColor = tab === 'micro' ? '#059669' : '#334155';
  graphsBtn.baseColor = tab === 'graphs' ? '#059669' : '#334155';
});

// 4. Scenery Display setup
const simWidth = 1080;
const simHeight = 680;

const display = new Display(rootNode, {
  width: simWidth,
  height: simHeight,
  backgroundColor: '#090d16'
});

const container = document.getElementById('sim-container');
if (container) {
  container.appendChild(display.domElement);
  display.initializeEvents();

  // Responsive scaling to fit window maintaining aspect ratio
  const resize = () => {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const scale = Math.min(windowW / simWidth, windowH / simHeight, 1.2);

    masterContainer.setScaleMagnitude(scale);
    masterContainer.x = Math.max(0, (windowW - simWidth * scale) / 2);
    masterContainer.y = Math.max(0, (windowH - simHeight * scale) / 2);

    display.setWidthHeight(windowW, windowH);
  };

  window.addEventListener('resize', resize);
  resize();
}

// 5. Main Animation Loop
let lastTime = performance.now();

function animate(currentTime: number) {
  requestAnimationFrame(animate);

  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  model.step(dt);

  if (macroView.visible) {
    macroView.stepView();
  }
  if (microView.visible) {
    microView.stepView();
  }
  if (graphsView.visible) {
    graphsView.stepView();
  }

  display.updateDisplay();
}

requestAnimationFrame(animate);
