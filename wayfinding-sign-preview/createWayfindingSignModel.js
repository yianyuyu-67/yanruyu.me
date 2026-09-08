import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SIGN_DIMENSIONS = Object.freeze({ width: 2.92, height: 5.55, depth: 0.42, plaqueHeight: 0.72 });

function material(color, roughness = 0.82, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function woodTexture(base, grain) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.24;
  context.strokeStyle = grain;
  context.lineWidth = 2;
  for (let x = -40; x < 300; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(x - 14, 68, x + 18, 150, x - 4, 256);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.1);
  return texture;
}

function labelTexture(text, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 180;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f1d4a4';
  context.font = '700 62px "Noto Serif SC", "Songti SC", serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = 'rgba(43, 24, 16, .46)';
  context.shadowBlur = 5;
  context.shadowOffsetY = 3;
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  context.shadowColor = 'transparent';
  context.strokeStyle = accent;
  context.lineWidth = 5;
  context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addBox(parent, name, size, position, mat, radius = 0.04) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 4, radius), mat);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addProfiledPlank(parent, name, width, height, depth, position, mat) {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const halfH = height / 2;
  const corner = Math.min(0.12, width * 0.08, height * 0.18);
  shape.moveTo(-halfW + corner, -halfH);
  shape.lineTo(halfW - corner, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + corner);
  shape.lineTo(halfW, halfH - corner);
  shape.quadraticCurveTo(halfW, halfH, halfW - corner, halfH);
  shape.lineTo(-halfW + corner, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - corner);
  shape.lineTo(-halfW, -halfH + corner);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + corner, -halfH);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.055, bevelThickness: 0.035, curveSegments: 4 });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addFrontLabel(parent, name, text, size, position, texture) {
  const labelMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.72,
    metalness: 0,
    side: THREE.DoubleSide
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), labelMaterial);
  label.name = name;
  // Reference front view faces +Z. Keep the text plane flush with the
  // positive-depth face of each plaque so side and rear views remain honest.
  label.position.set(position[0], position[1], position[2]);
  label.userData.text = text;
  label.renderOrder = 3;
  parent.add(label);
  return label;
}

export function createWayfindingSignModel() {
  const root = new THREE.Group();
  root.name = 'wayfindingSign';
  root.userData = {
    id: 'wayfindingSign',
    coordinateFrame: 'front faces +Z, up +Y, plaque width along X',
    dimensions: SIGN_DIMENSIONS,
    style: 'warm carved wood directional sign'
  };

  const wood = material(0x9b5f42, 0.84);
  wood.map = woodTexture('#9b5f42', '#e0a071');
  const woodLight = material(0xb87954, 0.82);
  woodLight.map = woodTexture('#b87954', '#e4a87a');
  const darkWood = material(0x63382c, 0.87);
  const ink = material(0x4d2b23, 0.9);
  const brass = material(0xc19052, 0.42, 0.55);
  const labels = [
    { id: 'profile', text: '自我介绍', label: '引路牌：自我介绍', navTarget: 'profile' },
    { id: 'internship', text: '实习经历', label: '引路牌：实习经历', navTarget: 'internship' },
    { id: 'skills', text: '技能介绍', label: '引路牌：技能介绍', navTarget: 'skills' },
    { id: 'portfolio', text: '作品集', label: '引路牌：作品集', navTarget: 'portfolio' }
  ];

  const post = addBox(root, 'wayfindingPost', [0.28, SIGN_DIMENSIONS.height, 0.32], [0, 0, 0], darkWood, 0.07);
  post.userData.partId = 'wayfindingPost';
  addBox(root, 'wayfindingPostCap', [0.38, 0.24, 0.38], [0, SIGN_DIMENSIONS.height / 2 + 0.08, 0], woodLight, 0.06);
  addBox(root, 'wayfindingPostFoot', [0.38, 0.24, 0.38], [0, -SIGN_DIMENSIONS.height / 2 - 0.08, 0], wood, 0.06);

  const topCap = addProfiledPlank(root, 'wayfindingTopCap', 2.92, 0.43, 0.46, [0, 2.58, 0], woodLight);
  topCap.rotation.z = -0.015;
  topCap.userData.partId = 'wayfindingTopCap';
  // The reference shows four rear-side support tabs peeking beyond the post.
  labels.forEach((entry, index) => {
    const y = 1.74 - index * (SIGN_DIMENSIONS.plaqueHeight + 0.22);
    const rearTab = addProfiledPlank(root, `rearSupport-${entry.id}`, 2.25, 0.54, 0.24, [0.02, y, -0.22], woodLight);
    rearTab.rotation.z = [0.02, -0.1, 0.06, -0.06][index];
    rearTab.userData.partId = `rearSupport-${entry.id}`;
    rearTab.renderOrder = 0;
  });

  const plaqueWidth = 2.42;
  const plaqueGap = 0.22;
  const startY = 1.74;
  labels.forEach((entry, index) => {
    const plaque = new THREE.Group();
    plaque.name = `wayfindingEntry-${entry.id}`;
    plaque.position.set(0, startY - index * (SIGN_DIMENSIONS.plaqueHeight + plaqueGap), 0.08);
    plaque.rotation.z = [0.02, -0.1, 0.06, -0.06][index];
    plaque.userData = {
      interactive: 'wayfinding-entry',
      id: `wayfindingEntry-${entry.id}`,
      label: entry.label,
      navTarget: entry.navTarget,
      sourceModel: 'wayfinding-sign-preview/createWayfindingSignModel.js'
    };
    root.add(plaque);

    const plate = addProfiledPlank(plaque, `${entry.id}-plaque`, plaqueWidth, SIGN_DIMENSIONS.plaqueHeight, 0.38, [0, 0, 0], woodLight);
    plate.userData.partId = `${entry.id}-plaque`;
    addProfiledPlank(plaque, `${entry.id}-inset`, plaqueWidth * 0.84, SIGN_DIMENSIONS.plaqueHeight * 0.68, 0.06, [0, 0, 0.2], ink);
    addFrontLabel(plaque, `${entry.id}-label`, entry.text, [plaqueWidth * 0.72, SIGN_DIMENSIONS.plaqueHeight * 0.48], [0, 0, 0.245], labelTexture(entry.text, '#f0bb84'));

    for (const x of [-plaqueWidth * 0.37, plaqueWidth * 0.37]) {
      const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), brass);
      bolt.name = `${entry.id}-bolt-${x < 0 ? 'left' : 'right'}`;
      bolt.position.set(x, 0, 0.235);
      bolt.castShadow = true;
      plaque.add(bolt);
    }
  });

  root.userData.entryIds = labels.map((entry) => `wayfindingEntry-${entry.id}`);
  root.traverse((object) => {
    if (object.isMesh) object.userData.partId ||= object.name;
  });
  return root;
}

export { SIGN_DIMENSIONS };
