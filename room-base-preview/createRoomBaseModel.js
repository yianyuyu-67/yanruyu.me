import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEFAULTS = Object.freeze({
  width: 20.8,
  depth: 16.4,
  height: 1.52,
  lowerHeight: 0.68,
  upperHeight: 0.68,
  radius: 0.42,
  frontOpeningWidth: 6.4,
  frontOpeningDepth: 1.1,
  frontSteps: true,
  planters: 2,
  streetLamp: false,
  agencyPlaque: false,
  agencyPlaqueTexture: null,
  agencyPlaqueWidthScale: 1,
  agencyPlaqueHeightScale: 1,
  agencyPlaqueFrameScale: 0.5,
  agencyPlaqueTilt: 0,
  detailScale: 1,
  seed: 31
});

function material(color, roughness = 0.82, metalness = 0, map = null) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, map });
}

function woodTexture(seed = 1, base = '#b4754d', grainLight = '#d7a075', grainDark = '#815037') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 0.14; ctx.strokeStyle = grainLight; ctx.lineWidth = 2;
  for (let y = -20; y < 540; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y);
    ctx.bezierCurveTo(120, y - 10 + seed, 250, y + 12, 512, y - 3); ctx.stroke();
  }
  ctx.globalAlpha = 0.08; ctx.strokeStyle = grainDark; ctx.lineWidth = 1;
  for (let y = 8; y < 512; y += 31) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + 5); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3.2, 2.2); return texture;
}

function stoneTexture(seed = 1, base = '#8b8b83', joint = '#d4d0c3', speckle = '#484944') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 0.13; ctx.strokeStyle = joint; ctx.lineWidth = 2;
  for (let x = 32; x < 512; x += 96) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + seed % 7, 512); ctx.stroke(); }
  for (let y = 64; y < 512; y += 82) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + 4); ctx.stroke(); }
  ctx.globalAlpha = 0.12; ctx.fillStyle = speckle;
  for (let i = 0; i < 180; i += 1) ctx.fillRect((i * 73 + seed * 11) % 512, (i * 41 + seed * 7) % 512, 2, 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2.8, 1.8); return texture;
}

function rounded(size, radius, materialRef) {
  return new RoundedBoxGeometry(size[0], size[1], size[2], 5, Math.min(radius, Math.min(...size) * 0.42));
}

function mesh(parent, name, geometry, materialRef, position = [0, 0, 0], userData = {}) {
  const object = new THREE.Mesh(geometry, materialRef); object.name = name; object.position.set(...position);
  object.castShadow = true; object.receiveShadow = true; object.userData = { partId: name, ...userData }; parent.add(object); return object;
}

function outlineShape(width, depth, radius, openingWidth, openingDepth) {
  const hw = width / 2; const hd = depth / 2; const r = Math.min(radius, hw * 0.18, hd * 0.35);
  const no = Math.min(openingWidth / 2, hw - r * 2); const nz = hd - openingDepth;
  return [
    [-hw + r, -hd], [hw - r, -hd], [hw, -hd + r], [hw, hd - r], [hw - r, hd],
    [no + 0.24, hd], [no, nz], [-no, nz], [-no - 0.24, hd], [-hw + r, hd], [-hw, hd - r], [-hw, -hd + r]
  ];
}

function extrudedOutline(points, y, height, bevel, materialRef) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], index) => { if (index === 0) shape.moveTo(x, -z); else shape.lineTo(x, -z); }); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSegments: 5, bevelSize: bevel, bevelThickness: bevel * 0.62, curveSegments: 6 });
  geometry.rotateX(-Math.PI / 2); geometry.translate(0, y, 0);
  return geometry;
}

function addPaving(parent, width, depth, zCenter, stone, prefix) {
  const group = new THREE.Group(); group.name = prefix; group.userData.partId = prefix; parent.add(group);
  const cols = 8; const rows = 3; const gap = 0.045; const tileW = width / cols; const tileD = depth / rows;
  for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
    const tile = new THREE.Mesh(rounded([tileW - gap, 0.075, tileD - gap], 0.04), stone);
    tile.name = `${prefix}Tile-${row}-${col}`; tile.position.set(-width / 2 + tileW * (col + 0.5), 0, zCenter - depth / 2 + tileD * (row + 0.5));
    tile.castShadow = true; tile.receiveShadow = true; tile.userData = { partId: prefix, tile: true }; group.add(tile);
  }
  return group;
}

function addDrainGrate(parent, z, width, dark, metal) {
  const grate = new THREE.Group(); grate.name = 'drainGrate'; grate.userData.partId = 'drainGrate'; parent.add(grate);
  mesh(grate, 'drainGrateFrame', rounded([1.42, 0.075, 0.72], 0.06, dark), dark, [0, 0, z]);
  for (let i = -4; i <= 4; i += 1) mesh(grate, `drainGrateBar-${i}`, rounded([0.07, 0.095, 0.58], 0.02, metal), metal, [i * 0.14, 0.02, z]);
  return grate;
}

function addPlanter(parent, x, z, wood, green, metal, index) {
  const group = new THREE.Group(); group.name = `planterDetails-${index}`; group.userData.partId = 'planterDetails'; group.position.set(x, 0, z); parent.add(group);
  mesh(group, 'planterBox', rounded([1.55, 0.52, 1.1], 0.11, wood), wood, [0, 0.28, 0]);
  for (let i = 0; i < 7; i += 1) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + (i % 3) * 0.035, 1), green);
    leaf.name = `planterLeaf-${index}-${i}`; leaf.position.set((i - 3) * 0.18, 0.68 + (i % 2) * 0.12, ((i * 3) % 5 - 2) * 0.12); leaf.scale.y = 0.65; leaf.castShadow = true; leaf.receiveShadow = true; leaf.userData = { partId: 'planterDetails', explodeWithParent: true }; group.add(leaf);
  }
  mesh(group, 'planterPost', new THREE.CylinderGeometry(0.055, 0.07, 0.95, 12), metal, [0.64, 0.74, 0.38]);
  return group;
}

function addStreetLamp(parent, x, z, metal, glow, index = 1) {
  const group = new THREE.Group(); group.name = `streetLamp-${index}`; group.userData = { partId: 'planterDetails', detail: 'street-lamp' }; group.position.set(x, 0, z); parent.add(group);
  mesh(group, 'lampFoot', rounded([0.42, 0.12, 0.42], 0.06, metal), metal, [0, 0.06, 0]);
  mesh(group, 'lampPole', new THREE.CylinderGeometry(0.055, 0.07, 1.38, 14), metal, [0, 0.75, 0]);
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.38, 6), metal); lantern.name = 'lampLantern'; lantern.position.set(0, 1.52, 0); lantern.castShadow = true; lantern.receiveShadow = true; lantern.userData = { partId: 'planterDetails', detail: 'street-lamp' }; group.add(lantern);
  const lampGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.25, 8), glow); lampGlow.name = 'lampGlow'; lampGlow.position.set(0, 1.52, 0.045); lampGlow.userData = { partId: 'planterDetails', detail: 'street-lamp' }; group.add(lampGlow);
  mesh(group, 'lampTop', new THREE.ConeGeometry(0.24, 0.14, 6), metal, [0, 1.78, 0]);
  return group;
}

function addAgencyPlaque(parent, x, z, wood, dark, metal, options = {}) {
  const widthScale = options.widthScale || 1;
  const heightScale = options.heightScale || 1;
  const frameScale = options.frameScale ?? 0.5;
  const frameMaterial = material(0xb08a45, 0.58, 0.18);
  const group = new THREE.Group(); group.name = 'agencyPlaque'; group.userData = { partId: 'edgeTrim', detail: 'agency-plaque' }; group.position.set(x, 0, z); parent.add(group);
  const bodyWidth = 2.05 * widthScale;
  const insetWidth = bodyWidth - 0.33 * frameScale;
  const bodyHeight = 0.52 * heightScale;
  const insetHeight = bodyHeight - 0.18 * heightScale * frameScale;
  const plaqueCenterY = bodyHeight * 0.5 + 0.16;
  mesh(group, 'agencyPlaqueBody', rounded([bodyWidth, bodyHeight, 0.10], 0.07, frameMaterial), frameMaterial, [0, plaqueCenterY, 0]);
  mesh(group, 'agencyPlaqueInset', rounded([insetWidth, insetHeight, 0.018], 0.04, dark), dark, [0, plaqueCenterY + 0.01, 0.055]);
  if (options.texturePath) {
    const texture = new THREE.TextureLoader().load(options.texturePath, (loadedTexture) => {
      // Reduce the reference artwork's photographic halo while preserving
      // bright lettering and gold linework. This keeps the plaque readable
      // without making the whole panel look emissive.
      const source = loadedTexture.image;
      if (!source?.width || !source?.height) return;
      const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(source, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
        const luminance = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
        const factor = luminance > 0.72 ? 0.98 : 0.38 + luminance * 0.35;
        pixels.data[i] = Math.min(255, r * factor);
        pixels.data[i + 1] = Math.min(255, g * factor);
        pixels.data[i + 2] = Math.min(255, b * factor);
      }
      ctx.putImageData(pixels, 0, 0);
      loadedTexture.image = canvas;
      loadedTexture.needsUpdate = true;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    // Keep a wider vertical slice of the reference so the tall upper flourish
    // on the Y remains visible while the lettering sits slightly smaller in
    // the plaque window.
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 0.72);
    texture.offset.set(0, 0.14);
    const imageMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.66, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 });
    // The source artwork is 2048:768; after the wider vertical crop its
    // displayed aspect is approximately (2048 / 768) / 0.72. Fit that aspect
    // inside the inset with a small margin on every side.
    const croppedAspect = (2048 / 768) / 0.72;
    const imageMaxWidth = insetWidth - 0.34;
    const imageMaxHeight = insetHeight - 0.20;
    const imageWidth = Math.min(imageMaxWidth, imageMaxHeight * croppedAspect);
    const imageHeight = imageWidth / croppedAspect;
    const imagePanel = mesh(group, 'agencyPlaqueImage', new THREE.PlaneGeometry(imageWidth, imageHeight), imageMat, [0, plaqueCenterY + 0.01, 0.066], { texturePath: options.texturePath, preserveAspect: true, croppedAspect, margin: 0.12 });
    imagePanel.renderOrder = 2;
  }
  const boltX = bodyWidth * 0.5 - 0.185;
  for (const px of [-boltX, boltX]) mesh(group, 'agencyPlaqueBolt', new THREE.SphereGeometry(0.045, 12, 8), metal, [px, plaqueCenterY + 0.01, 0.08]);
  group.rotation.x = options.tilt || 0;
  group.userData = { ...group.userData, widthScale, heightScale, frameScale, tiltDegrees: THREE.MathUtils.radToDeg(group.rotation.x), texturePath: options.texturePath || null };
  return group;
}

export function createRoomBaseModel(options = {}) {
  const c = { ...DEFAULTS, ...options };
  // Keep the underlay visibly distinct from the warm legacy floor while
  // matching the reference's softened charcoal stone palette.
  const lowerMat = material(0x5a5d5b, 0.9, 0, stoneTexture(c.seed));
  // The exposed outdoor platform is intentionally darker and cooler than the
  // warm indoor planks, while retaining a subtle mineral surface response.
  const upperMat = material(0xffffff, 0.92, 0, stoneTexture(c.seed + 3, '#4d3931', '#73564a', '#2d2420'));
  const stone = material(0xc2c0b6, 0.9, 0, stoneTexture(c.seed + 5));
  const wood = material(0xffffff, 0.82, 0, woodTexture(c.seed, '#b4754d', '#d7a075', '#815037'));
  const woodEdge = material(0xffffff, 0.86, 0, woodTexture(c.seed + 4, '#815037', '#ac7554', '#5f392b'));
  const woodSeam = material(0x81513b, 0.92, 0);
  const dark = material(0x242527, 0.78, 0.08);
  const glow = new THREE.MeshStandardMaterial({ color: 0xffd782, emissive: 0xffa63d, emissiveIntensity: 1.15, roughness: 0.38 });
  const metal = material(0x3b3b39, 0.42, 0.58);
  const green = material(0x66834b, 0.88, 0);
  const root = new THREE.Group(); root.name = 'roomBase';
  root.userData = {
    id: 'roomBase', dimensions: { width: c.width, depth: c.depth, height: c.height },
    interactionId: 'room-base',
    coordinateFrame: { up: '+Y', front: '+Z', origin: 'base center' },
    sculptRuntime: { nodes: ['lowerPlinth', 'upperPlatform', 'stonePaving', 'woodenFloor', 'frontOpening', 'frontSteps', 'edgeTrim', 'drainGrate', 'planterDetails', 'interactionAnchor'] },
    placementContract: { roomFit: 'derived-from-roomShell-world-bounds', wallsContactTop: true, frontOpening: 'central-recess' }
  };

  const outline = outlineShape(c.width, c.depth, c.radius, c.frontOpeningWidth, c.frontOpeningDepth);
  const lowerPlinth = mesh(root, 'lowerPlinth', extrudedOutline(outline, 0, c.lowerHeight, 0.16, lowerMat), lowerMat, [0, 0, 0], { partId: 'lowerPlinth' });
  const upperPlatform = mesh(root, 'upperPlatform', extrudedOutline(outline, c.lowerHeight, c.upperHeight, 0.13, upperMat), upperMat, [0, 0, 0], { partId: 'upperPlatform' });
  // Rounded bevels lift the platform's visible crown slightly above the raw
  // layer sum; use that crown as the seating plane for all surface details.
  const topY = c.lowerHeight + c.upperHeight + 0.14;

  const stoneGroup = addPaving(root, c.width * 0.93, c.depth * 0.28, c.depth * 0.36, stone, 'stonePaving'); stoneGroup.position.y = topY + 0.035;
  const woodGroup = new THREE.Group(); woodGroup.name = 'woodenFloor'; woodGroup.userData.partId = 'woodenFloor'; root.add(woodGroup);
  const floorWidth = c.width * 0.88; const floorDepth = c.depth * 0.54; const floorCenterZ = -c.depth * 0.12;
  mesh(woodGroup, 'woodenFloorSurface', rounded([floorWidth, 0.075, floorDepth], 0.08, wood), wood, [0, topY + 0.038, floorCenterZ]);
  const boardWidth = 1.15; const boardLength = 4.8; const floorMinZ = floorCenterZ - floorDepth / 2; const floorMaxZ = floorCenterZ + floorDepth / 2;
  for (let x = -floorWidth / 2 + boardWidth; x < floorWidth / 2; x += boardWidth) mesh(woodGroup, `woodFloorLongSeam-${x.toFixed(2)}`, new THREE.BoxGeometry(0.018, 0.012, floorDepth - 0.12), woodSeam, [x, topY + 0.082, floorCenterZ]);
  const boardColumns = Math.floor(floorWidth / boardWidth);
  for (let column = 0; column < boardColumns; column += 1) {
    const x = -floorWidth / 2 + boardWidth / 2 + column * boardWidth; const offset = (column % 3) * (boardLength / 3);
    for (let z = floorMinZ + offset + boardLength; z < floorMaxZ; z += boardLength) mesh(woodGroup, `woodFloorEndJoint-${column}-${z.toFixed(2)}`, new THREE.BoxGeometry(boardWidth - 0.08, 0.012, 0.018), woodSeam, [x, topY + 0.083, z]);
  }

  const frontOpening = new THREE.Group(); frontOpening.name = 'frontOpening'; frontOpening.userData = { partId: 'frontOpening', shape: 'central-recess' }; root.add(frontOpening);
  mesh(frontOpening, 'openingInset', rounded([c.frontOpeningWidth - 0.25, 0.05, c.frontOpeningDepth + 0.2], 0.05, dark), dark, [0, topY + 0.035, c.depth / 2 - c.frontOpeningDepth / 2 + 0.08]);
  const frontSteps = new THREE.Group(); frontSteps.name = 'frontSteps'; frontSteps.userData = { partId: 'frontSteps', interactionId: 'room-base-steps' }; root.add(frontSteps);
  if (c.frontSteps) {
    mesh(frontSteps, 'frontStepLower', rounded([c.frontOpeningWidth + 0.65, 0.26, 0.72], 0.09, lowerMat), lowerMat, [0, topY - 0.14, c.depth / 2 + 0.26]);
    mesh(frontSteps, 'frontStepUpper', rounded([c.frontOpeningWidth + 0.45, 0.22, 0.56], 0.08, stone), stone, [0, topY + 0.07, c.depth / 2 + 0.02]);
  }

  const edgeTrim = new THREE.Group(); edgeTrim.name = 'edgeTrim'; edgeTrim.userData.partId = 'edgeTrim'; root.add(edgeTrim);
  mesh(edgeTrim, 'edgeTrimRear', rounded([c.width - 0.3, 0.14, 0.18], 0.05, woodEdge), woodEdge, [0, topY + 0.12, -c.depth / 2 + 0.08]);
  mesh(edgeTrim, 'edgeTrimLeft', rounded([0.18, 0.14, c.depth - 0.55], 0.05, woodEdge), woodEdge, [-c.width / 2 + 0.08, topY + 0.12, 0]);
  mesh(edgeTrim, 'edgeTrimRight', rounded([0.18, 0.14, c.depth - 0.55], 0.05, woodEdge), woodEdge, [c.width / 2 - 0.08, topY + 0.12, 0]);
  addDrainGrate(root, c.depth * 0.24, c.width, dark, metal).position.y = topY + 0.075;
  if (c.planters > 0) { const planter = addPlanter(root, -c.width * 0.39, c.depth * 0.30, woodEdge, green, metal, 1); planter.position.y = topY; planter.scale.setScalar(c.detailScale); }
  if (c.planters > 1) { const planter = addPlanter(root, c.width * 0.39, c.depth * 0.30, woodEdge, green, metal, 2); planter.position.y = topY; planter.scale.setScalar(c.detailScale); }
  if (c.streetLamp) { const lamp = addStreetLamp(root, -c.width * 0.40, c.depth * 0.43, metal, glow); lamp.position.y = topY; lamp.scale.setScalar(c.detailScale); }
  if (c.agencyPlaque) {
    const plaque = addAgencyPlaque(root, -c.width * 0.24, c.depth * 0.49, woodEdge, dark, metal, {
      texturePath: c.agencyPlaqueTexture,
      widthScale: c.agencyPlaqueWidthScale,
      heightScale: c.agencyPlaqueHeightScale,
      frameScale: c.agencyPlaqueFrameScale,
      tilt: c.agencyPlaqueTilt
    });
    plaque.position.y = topY;
    plaque.scale.setScalar(c.detailScale);
  }

  const interactionAnchor = new THREE.Group(); interactionAnchor.name = 'interactionAnchor'; interactionAnchor.position.y = topY; interactionAnchor.userData = { interactionId: 'room-base', interactive: 'room-base', partId: 'interactionAnchor' }; root.add(interactionAnchor);
  root.traverse(object => { object.userData.modelId = 'roomBase'; if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  root.userData.interactionObjects = ['frontSteps', 'interactionAnchor'];
  root.userData.dimensions.topY = topY;
  return root;
}

export { DEFAULTS as ROOM_BASE_DEFAULTS };
