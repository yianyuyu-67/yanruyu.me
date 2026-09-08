import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const STARTUP_BOX_DIMENSIONS = Object.freeze({ width: 8.0, depth: 6.4, height: 6.4 });

const palette = {
  wood: 0xd6bf94,
  woodLight: 0xe3d2aa,
  woodInner: 0xc2a174,
  woodEdge: 0xd0b580,
  seam: 0x92714d,
  red: 0xa83f35,
  ink: 0x49372d,
};

function makeWoodTexture(base = '#d8b47a', grain = '#b98c59') {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
  ctx.globalAlpha = 0.16;
  for (let i = -40; i < 300; i += 18) {
    ctx.strokeStyle = grain; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 9, 64, i - 8, 135, i + 4, 256); ctx.stroke();
  }
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 30; i += 1) {
    const x = (i * 47) % 256;
    const y = (i * 83) % 256;
    ctx.fillStyle = grain; ctx.fillRect(x, y, 18 + (i % 5) * 8, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.2);
  return texture;
}

function makeGinghamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f6cf55'; ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(255, 247, 190, .38)';
  for (let i = 0; i < 256; i += 32) {
    ctx.fillRect(i, 0, 14, 256);
    ctx.fillRect(0, i, 256, 14);
  }
  ctx.fillStyle = 'rgba(214, 157, 28, .22)';
  for (let i = 0; i < 256; i += 32) {
    ctx.fillRect(i + 14, 0, 5, 256);
    ctx.fillRect(0, i + 14, 256, 5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  return texture;
}

function makeLidMessageTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1000; canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const serif = '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif';
  ctx.fillStyle = '#4a3020';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `600 126px ${serif}`;
  ctx.fillText('摆摊', canvas.width / 2, 142);
  ctx.font = `600 76px ${serif}`;
  ctx.fillText('是我做过', canvas.width / 2, 292);
  ctx.font = `600 126px ${serif}`;
  ctx.fillText('最快的 MVP!', canvas.width / 2, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function material(color, roughness = 0.84, map = null) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, map });
}

function rounded(name, size, position, mat, radius = 0.12, segments = 5) {
  const limit = Math.min(...size) * 0.44;
  const geometry = new RoundedBoxGeometry(size[0], size[1], size[2], segments, Math.min(radius, limit));
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function addMarkCell(group, name, z, y, kind, redMaterial) {
  const cell = new THREE.Group(); cell.name = name; cell.position.set(0, y, z); group.add(cell);
  const x = 0;
  cell.add(rounded(`${name}-border-top`, [0.06, 0.06, 0.82], [x, 0.43, 0], redMaterial, 0.02, 2));
  cell.add(rounded(`${name}-border-bottom`, [0.06, 0.06, 0.82], [x, -0.43, 0], redMaterial, 0.02, 2));
  cell.add(rounded(`${name}-border-left`, [0.06, 0.92, 0.06], [x, 0, -0.38], redMaterial, 0.02, 2));
  cell.add(rounded(`${name}-border-right`, [0.06, 0.92, 0.06], [x, 0, 0.38], redMaterial, 0.02, 2));
  if (kind === 'arrows') {
    for (const offset of [-0.18, 0.18]) {
      cell.add(rounded(`${name}-arrow-stem-${offset}`, [0.08, 0.46, 0.06], [x, -0.06, offset], redMaterial, 0.02, 2));
      cell.add(rounded(`${name}-arrow-head-${offset}`, [0.08, 0.16, 0.18], [x, 0.23, offset], redMaterial, 0.02, 2));
    }
  } else if (kind === 'glass') {
    cell.add(rounded(`${name}-glass-stem`, [0.08, 0.48, 0.09], [x, -0.10, 0], redMaterial, 0.02, 2));
    cell.add(rounded(`${name}-glass-bowl`, [0.08, 0.16, 0.30], [x, 0.20, 0], redMaterial, 0.03, 2));
  } else if (kind === 'umbrella') {
    cell.add(rounded(`${name}-umbrella-canopy`, [0.08, 0.12, 0.52], [x, 0.18, 0], redMaterial, 0.04, 3));
    cell.add(rounded(`${name}-umbrella-stem`, [0.08, 0.38, 0.06], [x, -0.10, 0], redMaterial, 0.02, 2));
  } else {
    cell.add(rounded(`${name}-recycle-ring`, [0.08, 0.48, 0.48], [x, 0, 0], redMaterial, 0.12, 5));
    cell.add(rounded(`${name}-recycle-cut`, [0.09, 0.16, 0.18], [x, 0.20, 0], redMaterial, 0.03, 2));
  }
  return cell;
}

export function createStartupBoxModel() {
  const root = new THREE.Group();
  root.name = 'startupBox';
  root.userData = {
    id: 'startupBox',
    coordinateFrame: 'front +Z, up +Y, origin at bottom-center',
    dimensions: STARTUP_BOX_DIMENSIONS,
    approximateRegions: ['backPanel', 'underside', 'rearFeet', 'interiorJoinery'],
    sculptRuntime: { clickable: true, explodable: true, pivot: { position: [0, 0, 0] } },
  };

  const woodTexture = makeWoodTexture('#d6bf94', '#ad8d62');
  const wood = material(palette.wood, 0.84, woodTexture);
  const woodLight = material(palette.woodLight, 0.86, woodTexture);
  const woodInner = material(palette.woodInner, 0.89, woodTexture);
  const woodEdge = material(palette.woodEdge, 0.86, woodTexture);
  const cloth = material(0xf4cb4d, 0.98, makeGinghamTexture());
  const seam = material(palette.seam, 0.9);
  const red = material(palette.red, 0.9);
  const ink = material(palette.ink, 0.93);

  const bodyShell = new THREE.Group(); bodyShell.name = 'bodyShell'; root.add(bodyShell);
  const sidePanels = new THREE.Group(); sidePanels.name = 'sidePanels'; bodyShell.add(sidePanels);
  sidePanels.add(rounded('sidePanelLeft', [0.46, 5.72, 6.04], [-3.77, 3.20, 0], wood, 0.14, 5));
  sidePanels.add(rounded('sidePanelRight', [0.46, 5.72, 6.04], [3.77, 3.20, 0], wood, 0.14, 5));
  bodyShell.add(rounded('backPanel', [7.22, 5.72, 0.28], [0, 3.20, -3.02], woodInner, 0.08, 4));
  bodyShell.add(rounded('basePanel', [7.30, 0.46, 6.02], [0, 0.70, 0], woodEdge, 0.12, 5));

  const topPanel = new THREE.Group(); topPanel.name = 'topPanel'; topPanel.position.set(0, 6.02, -3.0); root.add(topPanel);
  topPanel.userData.hinge = { axis: 'x', position: [0, 6.02, -3.0], closedRotation: 0, openRotation: -Math.PI * 0.62 };
  topPanel.add(rounded('topBoard', [7.34, 0.42, 6.00], [0, 0.10, 3.00], woodLight, 0.14, 5));
  const topBattens = new THREE.Group(); topBattens.name = 'topBattens'; topPanel.add(topBattens);
  for (const x of [-2.42, 2.42]) topBattens.add(rounded(`topBattten-${x < 0 ? 'left' : 'right'}`, [0.44, 0.34, 5.70], [x, 0.46, 3.00], woodEdge, 0.08, 4));
  const topLabel = new THREE.Group(); topLabel.name = 'topLabel'; topLabel.position.set(0, 0.34, 3.10); topPanel.add(topLabel);
  topLabel.add(rounded('topLabelPlate', [1.72, 0.05, 0.48], [0, 0, 0], ink, 0.03, 2));
  topLabel.add(rounded('topLabelInset', [1.48, 0.025, 0.25], [0, 0.035, 0], woodLight, 0.015, 2));
  const lidMessage = new THREE.Mesh(
    new THREE.PlaneGeometry(5.90, 3.78),
    new THREE.MeshBasicMaterial({ map: makeLidMessageTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false })
  );
  lidMessage.name = 'lidMessage';
  lidMessage.position.set(0, -0.14, 3.00);
  lidMessage.rotation.x = Math.PI / 2;
  lidMessage.renderOrder = 3;
  topPanel.add(lidMessage);

  const clothBundle = new THREE.Group();
  clothBundle.name = 'clothBundle';
  clothBundle.position.set(0, 1.34, 0.12);
  clothBundle.userData = { interactive: 'cloth-bundle', label: '黄色格纹布包', hoverScale: 1.14, hoverAxis: 'y' };
  clothBundle.add(rounded('clothBundleBody', [3.25, 0.58, 2.28], [0, 0.29, 0], cloth, 0.18, 5));
  clothBundle.add(rounded('clothBundleFold', [2.82, 0.28, 1.86], [0.10, 0.67, 0.02], cloth, 0.13, 5));
  clothBundle.add(rounded('clothBundleTieX', [0.28, 0.12, 2.04], [0, 0.84, 0], woodEdge, 0.04, 3));
  clothBundle.add(rounded('clothBundleTieZ', [2.92, 0.12, 0.22], [0, 0.85, 0], woodEdge, 0.04, 3));
  root.add(clothBundle);

  const frontFrame = new THREE.Group(); frontFrame.name = 'frontFrame'; root.add(frontFrame);
  const frameZ = 3.08;
  frontFrame.add(rounded('frontFrameLeft', [0.48, 5.25, 0.44], [-3.38, 3.18, frameZ], woodEdge, 0.10, 5));
  frontFrame.add(rounded('frontFrameRight', [0.48, 5.25, 0.44], [3.38, 3.18, frameZ], woodEdge, 0.10, 5));
  frontFrame.add(rounded('frontFrameTop', [6.78, 0.48, 0.44], [0, 5.56, frameZ], woodEdge, 0.10, 5));
  frontFrame.add(rounded('frontFrameBottom', [6.78, 0.52, 0.44], [0, 0.82, frameZ], woodEdge, 0.10, 5));
  const frontPanels = new THREE.Group(); frontPanels.name = 'frontPanels'; root.add(frontPanels);
  frontPanels.add(rounded('frontPanelLeft', [3.16, 4.28, 0.18], [-1.70, 3.16, 2.83], woodInner, 0.05, 3));
  frontPanels.add(rounded('frontPanelRight', [3.16, 4.28, 0.18], [1.70, 3.16, 2.83], woodInner, 0.05, 3));
  const frontDivider = new THREE.Group(); frontDivider.name = 'frontDivider'; root.add(frontDivider);
  frontDivider.add(rounded('frontDividerPost', [0.38, 4.60, 0.42], [0, 3.16, frameZ], woodEdge, 0.08, 4));
  const seams = new THREE.Group(); seams.name = 'seams'; root.add(seams);
  seams.add(rounded('frontSillSeam', [6.15, 0.06, 0.04], [0, 1.13, 3.30], seam, 0.01, 2));
  seams.add(rounded('frontDividerSeam', [0.05, 4.08, 0.04], [0, 3.16, 3.31], seam, 0.01, 2));

  const sideShippingMark = new THREE.Group(); sideShippingMark.name = 'sideShippingMark'; sideShippingMark.position.x = 4.02; root.add(sideShippingMark);
  addMarkCell(sideShippingMark, 'shippingRecycle', -0.62, 4.25, 'recycle', red);
  addMarkCell(sideShippingMark, 'shippingArrows', 0.50, 4.25, 'arrows', red);
  addMarkCell(sideShippingMark, 'shippingGlass', -0.62, 3.04, 'glass', red);
  addMarkCell(sideShippingMark, 'shippingUmbrella', 0.50, 3.04, 'umbrella', red);

  const frontMark = new THREE.Group(); frontMark.name = 'frontMark'; frontMark.position.set(-1.70, 2.10, 2.95); root.add(frontMark);
  frontMark.add(rounded('frontMarkPlate', [0.24, 0.72, 0.04], [0, 0, 0], ink, 0.03, 2));
  frontMark.add(rounded('frontMarkBar', [0.08, 0.38, 0.05], [0, 0.24, 0.03], woodInner, 0.02, 2));

  const feet = new THREE.Group(); feet.name = 'feet'; root.add(feet);
  for (const x of [-3.08, 3.08]) for (const z of [-2.42, 2.42]) {
    const foot = rounded(`foot-${x < 0 ? 'left' : 'right'}-${z < 0 ? 'back' : 'front'}`, [0.64, 0.55, 0.64], [x, 0.275, z], woodEdge, 0.07, 4);
    feet.add(foot);
  }

  root.traverse(object => {
    if (object.isMesh) {
      object.userData.partId = object.name;
      object.userData.replaceable = ['topBoard', 'backPanel', 'frontPanelLeft', 'frontPanelRight'].includes(object.name);
    }
  });
  root.userData.componentTree = [
    'bodyShell', 'topPanel/topBattens', 'frontFrame/frontPanels/frontDivider', 'sideShippingMark', 'frontMark', 'feet'
  ];
  root.userData.materialParams = { woodRoughness: 0.84, innerWoodRoughness: 0.89, redMarkRoughness: 0.9, metalness: 0 };
  root.userData.roundingParams = { largeRadius: 0.14, smallRadius: 0.06, largeSegments: 5, smallSegments: 3 };
  return root;
}

export const STARTUP_BOX_PALETTE = palette;
