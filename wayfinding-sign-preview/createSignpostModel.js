import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEFAULTS = Object.freeze({
  width: 0.52,
  height: 0.86,
  depth: 0.06,
  postWidth: 0.09,
  plaqueWidth: 0.42,
  plaqueHeight: 0.13,
  plaqueGap: 0.018,
  // Match the reference cap proportions: restore full horizontal span while
  // trimming only the vertical thickness to roughly 80% of the prior value.
  capHeight: 0.096,
  capWidthScale: 1,
  seed: 17
});

const ENTRIES = Object.freeze([
  { key: 'About', text: 'About me', labelName: 'labelAbout', interactionId: 'sign-about' },
  { key: 'Experience', text: 'Experience', labelName: 'labelExperience', interactionId: 'sign-experience' },
  { key: 'Skills', text: 'Skills', labelName: 'labelSkills', interactionId: 'sign-skills' },
  { key: 'Portfolio', text: 'Portfolio', labelName: 'labelPortfolio', interactionId: 'sign-portfolio' }
]);

function woodTexture(base, grain, seed = 17) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  let state = seed >>> 0;
  const rand = () => ((state = Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296;
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, 'rgba(255,235,207,.16)');
  gradient.addColorStop(.5, 'rgba(116,84,64,.055)');
  gradient.addColorStop(1, 'rgba(255,221,190,.12)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 0.15; ctx.strokeStyle = grain;
  for (let x = -80; x < 600; x += 22 + rand() * 18) {
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath(); ctx.moveTo(x, -20);
    ctx.bezierCurveTo(x - 28, 130, x + 34, 260, x - 10, 540); ctx.stroke();
  }
  ctx.globalAlpha = 0.06; ctx.strokeStyle = '#765840';
  for (let i = 0; i < 14; i += 1) {
    const y = rand() * 512; ctx.beginPath(); ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y - 8, 320, y + 10, 512, y - 4); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.1, 1.8); texture.anisotropy = 8;
  return texture;
}

function labelTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let fontSize = 158;
  ctx.font = `900 ${fontSize}px "Trebuchet MS", "Arial Rounded MT Bold", "Comic Sans MS", Arial, sans-serif`;
  while (ctx.measureText(text).width > 860 && fontSize > 112) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px "Trebuchet MS", "Arial Rounded MT Bold", "Comic Sans MS", Arial, sans-serif`;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(95,56,38,.52)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 5;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = '#a96f4d'; ctx.lineWidth = 23; ctx.strokeText(text, 512, 135);
  ctx.fillStyle = '#a96f4d'; ctx.fillText(text, 512, 135);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#f1d2a7'; ctx.lineWidth = 17; ctx.strokeText(text, 512, 128);
  ctx.fillStyle = '#fff2d2'; ctx.fillText(text, 512, 128);
  ctx.shadowColor = 'transparent';
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}

function roundedBoardGeometry(width, height, depth, radius = 0.018) {
  return new RoundedBoxGeometry(width, height, depth, 5, Math.min(radius, width * 0.18, height * 0.25));
}

function clippedCapGeometry(width, height, depth) {
  const shape = new THREE.Shape();
  const w = width / 2; const h = height / 2; const cut = Math.min(0.045, width * 0.12, height * 0.35);
  shape.moveTo(-w + cut, -h); shape.lineTo(w - cut, -h); shape.lineTo(w, -h + cut);
  shape.lineTo(w, h - cut); shape.lineTo(w - cut, h); shape.lineTo(-w + cut, h);
  shape.lineTo(-w, h - cut); shape.lineTo(-w, -h + cut); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.012, bevelThickness: 0.008, curveSegments: 4 });
  geometry.translate(0, 0, -depth / 2); return geometry;
}

function mesh(parent, name, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.name = name; object.position.set(...position);
  object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
}

function addInsetFrame(parent, entry, width, height, depth, materials) {
  const frameGroup = new THREE.Group(); frameGroup.name = `${entry.key.toLowerCase()}InsetFrame`;
  frameGroup.userData.role = 'recessed-front-frame'; parent.add(frameGroup);
  const frameW = width * 0.86; const frameH = height * 0.68; const bar = 0.012; const z = depth / 2 + 0.003;
  const dark = materials.cavity;
  mesh(frameGroup, `${entry.key.toLowerCase()}Inset`, roundedBoardGeometry(frameW, frameH, 0.008, 0.012), dark, [0, 0, z - 0.006]);
  mesh(frameGroup, `${entry.key.toLowerCase()}FrameTop`, new THREE.BoxGeometry(frameW, bar, 0.016), materials.frame, [0, frameH / 2, z]);
  mesh(frameGroup, `${entry.key.toLowerCase()}FrameBottom`, new THREE.BoxGeometry(frameW, bar, 0.016), materials.frame, [0, -frameH / 2, z]);
  mesh(frameGroup, `${entry.key.toLowerCase()}FrameLeft`, new THREE.BoxGeometry(bar, frameH, 0.016), materials.frame, [-frameW / 2, 0, z]);
  mesh(frameGroup, `${entry.key.toLowerCase()}FrameRight`, new THREE.BoxGeometry(bar, frameH, 0.016), materials.frame, [frameW / 2, 0, z]);
  return frameGroup;
}

function addRaisedLabel(entry, width, height, depth, materials) {
  const label = new THREE.Group(); label.name = entry.labelName;
  label.userData = { role: 'raised-lettering', interactionId: entry.interactionId, label: entry.text, text: entry.text };
  const carrier = mesh(label, `${label.name}Carrier`, roundedBoardGeometry(width * 0.76, height * 0.46, 0.009, 0.009), materials.cavity, [0, 0, depth / 2 + 0.013]);
  carrier.castShadow = true;
  const textMaterial = new THREE.MeshStandardMaterial({ map: labelTexture(entry.text), transparent: true, roughness: 0.48, metalness: 0, side: THREE.DoubleSide });
  const lettering = mesh(label, `${label.name}Text`, new THREE.PlaneGeometry(width * 0.82, height * 0.44), textMaterial, [0, 0, depth / 2 + 0.021]);
  lettering.renderOrder = 4; lettering.userData.interactionId = entry.interactionId;
  return label;
}

export function createSignpostModel(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const materials = {
    wood: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.74, metalness: 0, map: woodTexture('#c99a78', '#956e53', config.seed) }),
    postWood: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0, map: woodTexture('#b98b6c', '#815f49', config.seed + 4) }),
    cavity: new THREE.MeshStandardMaterial({ color: 0xc08a66, roughness: 0.85, metalness: 0 }),
    frame: new THREE.MeshStandardMaterial({ color: 0xd0a07d, roughness: 0.72, metalness: 0 }),
    letterCarrier: new THREE.MeshStandardMaterial({ color: 0xe1b98e, roughness: 0.62, metalness: 0 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb69b73, roughness: 0.4, metalness: 0.58 })
  };

  const signpost = new THREE.Group(); signpost.name = 'signpost';
  signpost.userData = { id: 'signpost', coordinateFrame: 'front +Z, up +Y, width +X', dimensions: { ...config }, entryIds: ENTRIES.map((entry) => entry.interactionId) };

  const verticalPost = new THREE.Group(); verticalPost.name = 'verticalPost'; verticalPost.userData.partId = 'verticalPost'; signpost.add(verticalPost);
  mesh(verticalPost, 'verticalPostCore', roundedBoardGeometry(config.postWidth, config.height - 0.04, config.depth, 0.018), materials.postWood, [0, 0, 0]);
  mesh(verticalPost, 'verticalPostFoot', roundedBoardGeometry(config.postWidth * 1.35, 0.04, config.depth * 1.12, 0.012), materials.postWood, [0, -config.height / 2 + 0.02, 0]);

  const topCap = new THREE.Group(); topCap.name = 'topCap'; topCap.userData.partId = 'topCap'; signpost.add(topCap);
  mesh(topCap, 'topCapBoard', clippedCapGeometry(config.width * config.capWidthScale, config.capHeight, config.depth), materials.wood, [0, config.height / 2 - config.capHeight / 2 - 0.01, 0]);

  const plaqueStart = config.height / 2 - config.capHeight - config.plaqueHeight * 0.9;
  const plaqueNames = ['signAbout', 'signExperience', 'signSkills', 'signPortfolio'];
  const plaqueWidths = ENTRIES.map((_, index) => index === 0 ? config.plaqueWidth * 0.9 : config.plaqueWidth);
  const tiltDegrees = [-5.2, 4.1, -6.4, 5.6];
  ENTRIES.forEach((entry, index) => {
    const plaque = new THREE.Group(); plaque.name = plaqueNames[index];
    plaque.position.set(0, plaqueStart - index * (config.plaqueHeight + config.plaqueGap), config.depth * 0.5);
    plaque.rotation.z = THREE.MathUtils.degToRad(tiltDegrees[index]);
    plaque.userData = { interactionId: entry.interactionId, label: entry.text, hoverScale: 1.035, role: 'interactive-plaque', entryKey: entry.key };
    signpost.add(plaque);
    const plaqueWidth = plaqueWidths[index];
    const plate = mesh(plaque, `${entry.key.toLowerCase()}Board`, roundedBoardGeometry(plaqueWidth, config.plaqueHeight, config.depth * 0.82, 0.017), materials.wood, [0, 0, 0]);
    plate.userData.interactionId = entry.interactionId;
    addInsetFrame(plaque, entry, plaqueWidth, config.plaqueHeight, config.depth * 0.82, materials);
    const label = addRaisedLabel(entry, plaqueWidth, config.plaqueHeight, config.depth * 0.82, materials);
    // Keep the raised front lettering in the same transform group as its
    // plaque so hover motion moves the board and lettering together.
    label.position.set(0, 0, 0); label.rotation.set(0, 0, 0); plaque.add(label);
    const hit = mesh(plaque, `${entry.key.toLowerCase()}HitArea`, new THREE.BoxGeometry(plaqueWidth * 0.96, config.plaqueHeight * 0.92, config.depth * 1.2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), [0, 0, 0.01]);
    hit.userData = { interactionId: entry.interactionId, label: entry.text, hitArea: true }; hit.castShadow = false; hit.receiveShadow = false;
  });

  const mountingBolts = new THREE.Group(); mountingBolts.name = 'mountingBolts'; mountingBolts.userData.partId = 'mountingBolts'; signpost.add(mountingBolts);
  ENTRIES.forEach((entry, index) => {
    const y = plaqueStart - index * (config.plaqueHeight + config.plaqueGap);
    const plaqueWidth = plaqueWidths[index];
    const tilt = THREE.MathUtils.degToRad(tiltDegrees[index]);
    const cosTilt = Math.cos(tilt); const sinTilt = Math.sin(tilt);
    [-1, 1].forEach((side) => {
      const localX = side * plaqueWidth * 0.34;
      const bolt = mesh(mountingBolts, `${entry.key.toLowerCase()}Bolt${side < 0 ? 'Left' : 'Right'}`, new THREE.SphereGeometry(0.009, 14, 10), materials.brass, [localX * cosTilt, y + localX * sinTilt, config.depth * 0.95]);
      bolt.scale.z = 0.42; bolt.userData.interactionId = entry.interactionId;
    });
    const rearConnector = mesh(mountingBolts, `${entry.key.toLowerCase()}RearConnector`, new THREE.CylinderGeometry(0.012, 0.012, 0.018, 14), materials.brass, [0, y, -config.depth * 0.58]);
    rearConnector.rotation.x = Math.PI / 2; rearConnector.userData.interactionId = entry.interactionId;
  });

  signpost.traverse((object) => {
    object.userData.modelId = 'signpost';
    if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  signpost.userData.interactionObjects = plaqueNames;
  signpost.userData.setHovered = (interactionId, active) => {
    signpost.traverse((object) => {
      const role = object.userData?.role;
      if (role !== 'interactive-plaque' && role !== 'raised-lettering') return;
      if (!active || object.userData.interactionId === interactionId) object.scale.setScalar(active ? (object.userData.hoverScale || 1.035) : 1);
    });
  };
  return signpost;
}

export { DEFAULTS as SIGNPOST_DIMENSIONS, ENTRIES as SIGNPOST_ENTRIES };
