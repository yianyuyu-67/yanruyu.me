import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const ROOM_SHELL_DIMENSIONS = Object.freeze({ width: 20, depth: 15.3, height: 15.3, wallThickness: 1 });

const palette = Object.freeze({
  wall: 0xe8dfd4,
  wallSide: 0xd9cec0,
  trim: 0x63382c,
  trimLight: 0x9d6244,
  floor: 0xb2764d,
  base: 0x4f342d,
  window: 0x302a27,
  glass: 0x7d9298,
  door: 0x6b4539,
  doorInset: 0x4f3029,
  iron: 0x292522,
  plaque: 0x9b6a32,
  plaqueInk: 0x2a1e18,
  checkerLight: 0xf4eee1,
  checkerDark: 0x35332f,
});

function makeWoodTexture(base, grain) {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
  ctx.globalAlpha = 0.14; ctx.strokeStyle = grain; ctx.lineWidth = 1;
  for (let i = -20; i < 290; i += 16) {
    ctx.beginPath(); ctx.moveTo(0, i);
    ctx.bezierCurveTo(62, i + 8, 142, i - 7, 256, i + 2); ctx.stroke();
  }
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 38; i += 1) ctx.fillRect((i * 73) % 256, (i * 41) % 256, 18, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.3, 1.3);
  return texture;
}

function makeFloorPlankTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b2764d'; ctx.fillRect(0, 0, 512, 512);
  const plankWidth = 48; const plankLength = 230;
  ctx.globalAlpha = 0.3; ctx.strokeStyle = '#754832'; ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += plankWidth) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  ctx.globalAlpha = 0.26;
  for (let column = 0; column < Math.ceil(512 / plankWidth); column += 1) {
    const x = column * plankWidth; const offset = (column % 3) * (plankLength / 3);
    for (let y = offset; y < 512; y += plankLength) { ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(Math.min(x + plankWidth - 2, 512), y); ctx.stroke(); }
  }
  ctx.globalAlpha = 0.09; ctx.strokeStyle = '#e3ba91'; ctx.lineWidth = 1;
  for (let i = 0; i < 42; i += 1) { const x = (i * 37 + 11) % 512; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 5, 145, x - 6, 370, x + 3, 512); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1.1, 1.1);
  return texture;
}

function mat(color, roughness = 0.84, map = null, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, map });
}

function rounded(name, size, position, material, radius = 0.12, segments = 5, parent = null) {
  const limit = Math.min(...size) * 0.44;
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, Math.min(radius, limit)), material);
  mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true;
  (parent || this?.root)?.add?.(mesh);
  return mesh;
}

function extrudePlan(name, points, height, y, material, options = {}) {
  const shape = new THREE.Shape();
  // Three.js ShapeUtils expects the outer ring in a consistent winding. The
  // reference outlines are supplied clockwise in room space, so reverse them
  // here to avoid a flipped diagonal triangle on the concave cutout.
  [...points].reverse().forEach(([x, z], index) => {
    const p = [x, -z];
    if (index === 0) shape.moveTo(p[0], p[1]); else shape.lineTo(p[0], p[1]);
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: options.bevel !== false,
    bevelSegments: options.segments || 5,
    bevelSize: options.bevelSize ?? 0.08,
    bevelThickness: options.bevelThickness ?? 0.05,
    curveSegments: 4,
  });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name; mesh.position.y = y; mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function extrudeElevation(name, points, depth, z, y, material) {
  const shape = new THREE.Shape();
  points.forEach(([x, h], index) => { if (index === 0) shape.moveTo(x, h); else shape.lineTo(x, h); });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.07, bevelThickness: 0.05, curveSegments: 4 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name; mesh.position.set(0, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// Extrude a side-wall elevation along X. `points` are [worldZ, height].
function extrudeSide(name, points, depth, x, y, material) {
  const shape = new THREE.Shape();
  points.forEach(([z, h], index) => { const u = -z; if (index === 0) shape.moveTo(u, h); else shape.lineTo(u, h); });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.07, bevelThickness: 0.05, curveSegments: 4 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name; mesh.rotation.y = Math.PI / 2; mesh.position.set(x - depth / 2, y, 0);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function addBox(parent, name, size, position, material, radius = 0.1, segments = 4, rotation = [0, 0, 0]) {
  const mesh = rounded(name, size, position, material, radius, segments);
  mesh.rotation.set(...rotation); parent.add(mesh); return mesh;
}

function addPlaque(parent, name, size, position, material, textColor = null) {
  const plaque = new THREE.Group(); plaque.name = name; plaque.position.set(...position); parent.add(plaque);
  addBox(plaque, `${name}-plate`, size, [0, 0, 0], material, 0.06, 3);
  addBox(plaque, `${name}-inset`, [size[0] * 0.84, size[1] * 0.56, size[2] * 0.35], [0, 0, size[2] * 0.58], textColor || mat(palette.plaqueInk, 0.74), 0.025, 2);
  plaque.userData.replaceableTexture = `assets/signs/${name}.png`;
  return plaque;
}

function addPlaqueFrontTexture(parent, name, imagePath, plaqueWidth, plaqueHeight, fallbackName = `${name}-inset`, position = [0, 0, 0.19], hideFallbackOnLoad = true) {
  const imageAspect = 1923 / 434;
  // Contain the uncropped logo inside the thin plaque face; never stretch it.
  const width = Math.min(plaqueWidth * 0.86, plaqueHeight * 0.82 * imageAspect);
  const height = width / imageAspect;
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.76, metalness: 0.04, transparent: true, opacity: 1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${name}-frontTexture`; mesh.position.set(...position); mesh.visible = false;
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData = { id: `${name}-frontTexture`, replaceableTexture: imagePath, fit: 'contain', orientation: 'horizontal', fallback: 'original plaque inset material', loadStatus: 'pending' };
  parent.add(mesh);
  const loader = new THREE.TextureLoader();
  const resolvedImagePath = new URL(imagePath, import.meta.url).href;
  loader.load(resolvedImagePath, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    material.map = texture;
    material.alphaTest = 0;
    material.needsUpdate = true; mesh.visible = true; mesh.userData.loadStatus = 'loaded';
    if (hideFallbackOnLoad) {
      const inset = parent.getObjectByName(fallbackName);
      if (inset) inset.visible = false;
    }
  }, undefined, () => { mesh.visible = false; mesh.userData.loadStatus = 'error'; });
  return mesh;
}

function addInteriorWindowImage(parent, fallback, imagePath, width, height, position) {
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
  material.toneMapped = false;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.name = 'leftWindowImage';
  mesh.position.set(...position);
  mesh.rotation.y = Math.PI / 2;
  mesh.visible = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData = {
    id: 'leftWindowImage',
    texturePath: imagePath,
    fit: 'cover',
    facing: 'interior-world-positive-x',
    side: 'front-only',
    loadStatus: 'pending',
    fallback: fallback.name,
  };
  parent.add(mesh);

  new THREE.TextureLoader().load(new URL(imagePath, import.meta.url).href, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const imageAspect = texture.image.width / texture.image.height;
    const windowAspect = width / height;
    if (imageAspect > windowAspect) {
      texture.repeat.x = windowAspect / imageAspect;
      texture.offset.x = (1 - texture.repeat.x) / 2;
    } else {
      texture.repeat.y = imageAspect / windowAspect;
      texture.offset.y = (1 - texture.repeat.y) / 2;
    }

    material.map = texture;
    material.needsUpdate = true;
    mesh.visible = true;
    fallback.visible = false;
    mesh.userData.loadStatus = 'loaded';
    mesh.userData.sourceSize = [texture.image.width, texture.image.height];
    mesh.userData.textureRepeat = texture.repeat.toArray();
    mesh.userData.textureOffset = texture.offset.toArray();
  }, undefined, () => {
    mesh.visible = false;
    fallback.visible = true;
    mesh.userData.loadStatus = 'error';
  });

  return mesh;
}

function addCheckerSteps(parent, centerZ, width) {
  const steps = new THREE.Group(); steps.name = 'doorSteps'; parent.add(steps);
  for (let level = 0; level < 2; level += 1) {
    const depth = 0.72; const z = centerZ + 1.7 + level * 0.62;
    addBox(steps, `step-${level + 1}-base`, [2.9, 0.28, depth], [-0.05, 0.14 + level * 0.22, z], mat(palette.trim, 0.86), 0.08, 4);
    for (let i = 0; i < 4; i += 1) {
      const tile = i % 2 === level % 2 ? palette.checkerLight : palette.checkerDark;
      addBox(steps, `step-${level + 1}-tile-${i + 1}`, [width / 4 - 0.04, 0.035, depth / 2 - 0.04], [-1.08 + i * 0.72, 0.31 + level * 0.22, z - 0.11], mat(tile, 0.9), 0.02, 2);
      addBox(steps, `step-${level + 1}-tile-${i + 5}`, [width / 4 - 0.04, 0.035, depth / 2 - 0.04], [-1.08 + i * 0.72, 0.31 + level * 0.22, z + 0.17], mat(tile === palette.checkerLight ? palette.checkerDark : palette.checkerLight, 0.9), 0.02, 2);
    }
  }
}

export function createRoomShellModel() {
  const root = new THREE.Group(); root.name = 'roomShell';
  root.userData = {
    id: 'roomShell',
    coordinateFrame: 'front +Z, up +Y, origin at base center',
    dimensions: ROOM_SHELL_DIMENSIONS,
    sourceReferences: ['4bc96099-171b-44d1-ab61-d8bfc0fdb318.png', 'screenshot-20260827-235624.png', 'screenshot-20260827-235608.png'],
    approximateRegions: ['rear-wall-hidden-face', 'underside-of-base', 'wall-joinery-behind-trims', 'door-hardware-hidden-side'],
  };

  const wood = mat(palette.trim, 0.82, makeWoodTexture('#63382c', '#b27450'));
  const woodLight = mat(palette.trimLight, 0.82, makeWoodTexture('#9d6244', '#d39a6e'));
  // These full-colour canvas maps carry the albedo. A white material multiplier
  // prevents Three.js from multiplying the same hue twice and darkening it.
  const roofTrimMat = mat(0xffffff, 0.84, makeWoodTexture('#9a654d', '#c98d6d'));
  const wainscotMat = mat(0xffffff, 0.86, makeWoodTexture('#b88f70', '#d1ad91'));
  const wainscotAccentMat = mat(0xffffff, 0.86, makeWoodTexture('#9e765d', '#c19a7f'));
  const wallMat = mat(palette.wall, 0.88);
  const wallSideMat = mat(palette.wallSide, 0.9);
  const floorMat = mat(0xffffff, 0.88, makeFloorPlankTexture());
  const baseMat = mat(palette.base, 0.86, makeWoodTexture('#4d3b3b', '#765048'));
  const darkMat = mat(palette.window, 0.8, null, 0.05);
  const windowPanelMat = mat(0xb7aa97, 0.88, null, 0);
  const glassMat = mat(palette.glass, 0.35, null, 0.15); glassMat.transparent = true; glassMat.opacity = 0.8;
  const doorMat = mat(palette.door, 0.78);
  const doorInsetMat = mat(palette.doorInset, 0.84);
  const ironMat = mat(palette.iron, 0.45, null, 0.55);
  const plaqueMat = mat(palette.plaque, 0.72);

  const baseTrim = new THREE.Group(); baseTrim.name = 'baseTrim'; baseTrim.userData = { id: 'baseTrim', thickness: 0.95 }; root.add(baseTrim);
  const baseOutline = [[-10, -7.65], [10, -7.65], [10, 7.55], [4.6, 7.55], [4.6, 6.45], [-4.1, 6.45], [-4.1, 7.55], [-10, 7.55]];
  // Keep the concave cutout as a clean polygon extrusion. Beveling a concave
  // n-gon can introduce diagonal triangulation artifacts across the recess;
  // the visible rounded edge is supplied by the separate perimeter rails.
  const baseBlock = extrudePlan('baseTrimSolid', baseOutline, 0.95, 0, baseMat, { bevel: false }); baseTrim.add(baseBlock);
  const frontRailLeft = addBox(baseTrim, 'baseFrontRailLeft', [5.8, 0.3, 0.62], [-7.1, 0.98, 6.9], wood, 0.09, 4);
  const frontRailRight = addBox(baseTrim, 'baseFrontRailRight', [5.0, 0.3, 0.62], [7.5, 0.98, 6.9], wood, 0.09, 4);
  frontRailLeft.userData.edgeRole = 'asymmetric-cutout-left'; frontRailRight.userData.edgeRole = 'asymmetric-cutout-right';

  const baseFloor = new THREE.Group(); baseFloor.name = 'baseFloor'; baseFloor.userData = { id: 'baseFloor', continuousWith: 'baseTrimSolid', cutout: 'front stepped recess' }; root.add(baseFloor);
  const floorOutline = [[-9.68, -7.32], [9.68, -7.32], [9.68, 7.18], [4.36, 7.18], [4.36, 6.12], [-3.86, 6.12], [-3.86, 7.18], [-9.68, 7.18]];
  baseFloor.add(extrudePlan('floorSurface', floorOutline, 0.4, 0.95, floorMat, { bevel: false }));
  const floorPlankLines = new THREE.Group(); floorPlankLines.name = 'floorPlankLines'; floorPlankLines.userData = { id: 'floorPlankLines', pattern: 'narrow-long-boards-with-staggered-end-joints' }; baseFloor.add(floorPlankLines);
  const floorLineMat = mat(0x81513b, 0.92);
  const floorBoardWidth = 1.15; const floorBoardLength = 5.1;
  for (let x = -8.55; x <= 8.55; x += floorBoardWidth) {
    addBox(floorPlankLines, `floorLongSeam-${x.toFixed(2)}`, [0.025, 0.018, 12.15], [x, 1.365, -1.25], floorLineMat, 0.01, 2);
    if (x > -3.65) addBox(floorPlankLines, `floorLongSeamFront-${x.toFixed(2)}`, [0.025, 0.018, 1.75], [x, 1.365, 5.8], floorLineMat, 0.01, 2);
  }
  for (let column = 0; column < 16; column += 1) {
    const x = -9.125 + column * floorBoardWidth; const offset = (column % 3) * (floorBoardLength / 3);
    for (let z = -5.65 + offset; z <= 4.75; z += floorBoardLength) addBox(floorPlankLines, `floorEndJoint-${column}-${z.toFixed(2)}`, [1.08, 0.018, 0.025], [x, 1.366, z], floorLineMat, 0.01, 2);
  }
  const baseCutout = new THREE.Group(); baseCutout.name = 'baseCutout'; baseCutout.userData = { id: 'baseCutout', shape: 'single asymmetric front recess', outline: [[-3.86, 6.82], [4.36, 6.82], [4.36, 6.12], [-3.86, 6.12]] }; baseTrim.add(baseCutout);

  const wallBase = 1.35;
  const backWall = new THREE.Group(); backWall.name = 'backWall'; backWall.userData = { id: 'backWall', thickness: 1, profile: 'flat-except-left-raised-sign' }; root.add(backWall);
  const backProfile = [[-10, 0], [10, 0], [10, 12.9], [-10, 12.9]];
  backWall.add(extrudeElevation('backWallSolid', backProfile, 1, -7.65, wallBase, wallMat));
  const backWallTopTrim = new THREE.Group(); backWallTopTrim.name = 'roofTrim'; backWallTopTrim.userData = { id: 'roofTrim', bevelSegments: 5 }; root.add(backWallTopTrim);
  addBox(backWallTopTrim, 'backWallTopRail', [20.15, 0.63, 1.2], [0, wallBase + 13.225, -7.15], roofTrimMat, 0.11, 5);
  backWallTopTrim.userData.profile = 'single-flat-rail';

  // Warm wood wainscot sits on the room-facing side without changing the wall envelope.
  const backWainscot = new THREE.Group(); backWainscot.name = 'wainscot'; backWainscot.userData = { id: 'wainscot', wall: 'backWall', height: 4.5, color: '#B88F70', roughness: 0.86, grain: 'low-contrast-vertical-wood' }; backWall.add(backWainscot);
  addBox(backWainscot, 'backWainscotPanel', [19.55, 4.5, 0.12], [0, wallBase + 2.25, -6.56], wainscotMat, 0.04, 3);
  addBox(backWainscot, 'backWainscotTopRail', [19.65, 0.16, 0.16], [0, wallBase + 4.56, -6.49], wainscotAccentMat, 0.025, 2);
  addBox(backWainscot, 'backWainscotBottomRail', [19.65, 0.16, 0.16], [0, wallBase + 0.08, -6.49], wainscotAccentMat, 0.025, 2);
  for (let x = -8.9; x <= 8.9; x += 1.05) addBox(backWainscot, `backWainscotRail-${x.toFixed(2)}`, [0.08, 4.52, 0.14], [x, wallBase + 2.25, -6.42], wainscotAccentMat, 0.025, 2);

  // Extend the rear wall sections into the back-wall envelope. The original
  // -6.15 datum left a visible slot before the back wall's inner face at -6.65.
  const wallJoinZ = -6.72;
  const leftWall = new THREE.Group(); leftWall.name = 'leftWall'; leftWall.userData = { id: 'leftWall', thickness: 1, length: 6.3, openFront: true, window: 'leftWindow', leftWindowOpening: true }; root.add(leftWall);
  const leftRear = extrudeSide('leftWallSolidRear', [[wallJoinZ, 0], [-4.92, 0], [-4.92, 12.48], [wallJoinZ, 12.48]], 1, -9.5, wallBase, wallSideMat);
  const leftFront = extrudeSide('leftWallSolidFront', [[-1.85, 0], [0.15, 0], [0.15, 12.48], [-1.85, 12.48]], 1, -9.5, wallBase, wallSideMat);
  const leftWindowLower = extrudeSide('leftWallWindowSill', [[-4.92, 0], [-1.85, 0], [-1.85, 4.55], [-4.92, 4.55]], 1, -9.5, wallBase, wallSideMat);
  const leftWindowUpper = extrudeSide('leftWallWindowLintel', [[-4.92, 9.05], [-1.85, 9.05], [-1.85, 12.48], [-4.92, 12.48]], 1, -9.5, wallBase, wallSideMat);
  [leftRear, leftFront, leftWindowLower, leftWindowUpper].forEach((mesh) => { mesh.userData.id = 'leftWall'; leftWall.add(mesh); });
  const leftCap = addBox(leftWall, 'leftWallTopTrim', [1.344, 0.63, 6.96], [-9.5, wallBase + 12.795, -3.24], roofTrimMat, 0.12, 5);
  leftCap.userData.id = 'leftWallTopTrim';
  const leftWindow = new THREE.Group(); leftWindow.name = 'leftWindow'; leftWindow.userData = { id: 'leftWindow', approximate: true, replaceableTexture: '../assets/windows/autumn-maple.jpg' }; leftWall.add(leftWindow);
  const leftWindowTexturePanel = addBox(leftWindow, 'leftWindowTexturePanel', [0.08, 4.5, 3.35], [-9.5, wallBase + 6.8, -3.38], windowPanelMat, 0.03, 3);
  leftWindowTexturePanel.userData.replaceableTexture = '../assets/windows/autumn-maple.jpg';
  leftWindowTexturePanel.userData.supportsTextureReplacement = true;
  addInteriorWindowImage(leftWindow, leftWindowTexturePanel, '../assets/windows/autumn-maple.jpg', 2.7, 3.85, [-9.56, wallBase + 6.8, -3.38]);
  const leftWindowGlassMat = glassMat.clone();
  leftWindowGlassMat.color.set(0xd6e0de);
  leftWindowGlassMat.opacity = 0.2;
  addBox(leftWindow, 'leftWindowGlass', [0.06, 3.85, 2.7], [-9.5, wallBase + 6.8, -3.38], leftWindowGlassMat, 0.02, 2);
  addBox(leftWindow, 'leftWindowFrameTopInner', [0.18, 0.24, 3.7], [-8.9, wallBase + 9.02, -3.38], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameBottomInner', [0.18, 0.24, 3.7], [-8.9, wallBase + 4.58, -3.38], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameLInner', [0.18, 4.7, 0.24], [-8.9, wallBase + 6.8, -5.25], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameRInner', [0.18, 4.7, 0.24], [-8.9, wallBase + 6.8, -1.51], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameTopOuter', [0.18, 0.24, 3.7], [-10.08, wallBase + 9.02, -3.38], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameBottomOuter', [0.18, 0.24, 3.7], [-10.08, wallBase + 4.58, -3.38], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameLOuter', [0.18, 4.7, 0.24], [-10.08, wallBase + 6.8, -5.25], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowFrameROuter', [0.18, 4.7, 0.24], [-10.08, wallBase + 6.8, -1.51], wood, 0.04, 3);
  addBox(leftWindow, 'leftWindowCrossV', [0.12, 4.05, 0.12], [-8.82, wallBase + 6.8, -3.38], ironMat, 0.02, 2);
  addBox(leftWindow, 'leftWindowCrossH', [0.12, 0.12, 2.9], [-8.82, wallBase + 6.8, -3.38], ironMat, 0.02, 2);
  leftWindow.userData.innerFrame = true; leftWindow.userData.outerFrame = true; leftWindow.userData.openingThroughWall = true;
  const leftWainscot = new THREE.Group(); leftWainscot.name = 'wainscot'; leftWainscot.userData = { id: 'wainscot', wall: 'leftWall', height: 4.5, color: '#B88F70', roughness: 0.86, grain: 'low-contrast-vertical-wood' }; leftWall.add(leftWainscot);
  addBox(leftWainscot, 'leftWainscotRear', [0.12, 4.5, 1.80], [-8.92, wallBase + 2.25, -5.82], wainscotMat, 0.04, 3);
  addBox(leftWainscot, 'leftWainscotFront', [0.12, 4.5, 1.95], [-8.92, wallBase + 2.25, -0.86], wainscotMat, 0.04, 3);
  addBox(leftWainscot, 'leftWainscotWindowBay', [0.12, 4.5, 3.07], [-8.92, wallBase + 2.25, -3.385], wainscotMat, 0.04, 3);
  addBox(leftWainscot, 'leftWainscotRearCap', [0.16, 0.16, 1.88], [-8.92, wallBase + 4.56, -5.82], wainscotAccentMat, 0.025, 2);
  addBox(leftWainscot, 'leftWainscotFrontCap', [0.16, 0.16, 2.03], [-8.92, wallBase + 4.56, -0.86], wainscotAccentMat, 0.025, 2);
  addBox(leftWainscot, 'leftWainscotWindowBayCap', [0.16, 0.16, 3.13], [-8.92, wallBase + 4.56, -3.385], wainscotAccentMat, 0.025, 2);

  const rightWall = new THREE.Group(); rightWall.name = 'rightWall'; rightWall.userData = { id: 'rightWall', thickness: 1, openFront: true, doorEmbedded: true }; root.add(rightWall);
  const doorZ = 2.55; const doorWidth = 3.15; const doorHeight = 9.45; const rearEnd = doorZ - doorWidth / 2; const frontStart = doorZ + doorWidth / 2;
  rightWall.add(extrudeSide('rightWallRear', [[wallJoinZ, 0], [rearEnd, 0], [rearEnd, 12.35], [wallJoinZ, 12.35]], 1, 9.5, wallBase, wallMat));
  // Match the front return to the rear wall/cap datum so no open slot remains
  // beneath the enlarged top trim at the right-hand corner.
  rightWall.add(extrudeSide('rightWallFront', [[frontStart, 0], [6.45, 0], [6.45, 12.35], [frontStart, 12.35]], 1, 9.5, wallBase, wallMat));
  rightWall.add(extrudeSide('rightWallLintel', [[rearEnd, doorHeight], [frontStart, doorHeight], [frontStart, 12.35], [rearEnd, 12.35]], 1, 9.5, wallBase, wallMat));
  // Seat the cap above the tallest right-wall segment. This covers the former
  // exposed white wall strip instead of leaving wall material above the trim.
  const rightCap = addBox(rightWall, 'rightWallTopTrim', [1.344, 0.63, 13.20], [9.5, wallBase + 12.665, -0.12], roofTrimMat, 0.12, 5); rightCap.userData.id = 'rightWallTopTrim';

  const doorFrame = new THREE.Group(); doorFrame.name = 'doorFrame'; doorFrame.userData = { id: 'doorFrame', thickness: 0.3, visibleSurround: false, compatibilityPlaceholder: true }; rightWall.add(doorFrame);
  const door = new THREE.Group(); door.name = 'door'; door.userData = { id: 'door', interactive: 'door', label: '蓝紫色入口门' }; rightWall.add(door);
  addBox(door, 'doorPanel', [1, doorHeight, doorWidth], [9.5, wallBase + doorHeight / 2, doorZ], doorMat, 0.12, 5);
  addBox(door, 'doorLowerInset', [1.06, 3.1, 2.25], [9.5, wallBase + 1.85, doorZ], doorInsetMat, 0.08, 4);
  addBox(door, 'doorGlass', [1.06, 3.35, 2.4], [9.5, wallBase + 7.25, doorZ], glassMat, 0.08, 4);
  addBox(door, 'doorMullionV', [1.12, 3.4, 0.14], [9.5, wallBase + 7.25, doorZ], ironMat, 0.03, 2);
  addBox(door, 'doorMullionH', [1.12, 0.14, 2.35], [9.5, wallBase + 7.25, doorZ], ironMat, 0.03, 2);
  addBox(door, 'doorTransom', [1.06, 1.05, 2.45], [9.5, wallBase + 10.05, doorZ], doorInsetMat, 0.08, 4);
  addBox(door, 'doorTransomBar', [1.18, 0.12, 2.2], [9.5, wallBase + 10.05, doorZ], ironMat, 0.025, 2);
  addBox(door, 'doorArchBar', [1.18, 0.14, 2.5], [9.5, wallBase + 8.98, doorZ], woodLight, 0.04, 3);
  const doorArch = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.075, 8, 24, Math.PI), ironMat);
  doorArch.name = 'doorArchOrnament'; doorArch.rotation.set(0, Math.PI / 2, 0); doorArch.scale.set(1, 1, 0.82); doorArch.position.set(10.08, wallBase + 8.78, doorZ); doorArch.castShadow = true; doorArch.receiveShadow = true; door.add(doorArch);
  const transomScroll = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 16, Math.PI * 1.35), ironMat);
  transomScroll.name = 'doorTransomScroll'; transomScroll.rotation.set(0, Math.PI / 2, 0); transomScroll.position.set(10.08, wallBase + 10.05, doorZ); transomScroll.scale.set(1, 0.62, 1); transomScroll.castShadow = true; transomScroll.receiveShadow = true; door.add(transomScroll);
  const handleMat = mat(0xd9aa43, 0.42, null, 0.35);
  const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), handleMat);
  doorHandle.name = 'doorHandle'; doorHandle.position.set(10.12, wallBase + 5.1, doorZ - 0.98); doorHandle.castShadow = true; doorHandle.receiveShadow = true; door.add(doorHandle);
  const rightWainscot = new THREE.Group(); rightWainscot.name = 'wainscot'; rightWainscot.userData = { id: 'wainscot', wall: 'rightWall', height: 4.5, color: '#B88F70', roughness: 0.86, grain: 'low-contrast-vertical-wood' }; rightWall.add(rightWainscot);
  addBox(rightWainscot, 'rightWainscotRear', [0.12, 4.5, 7.70], [8.92, wallBase + 2.25, -2.87], wainscotMat, 0.04, 3);
  addBox(rightWainscot, 'rightWainscotFront', [0.12, 4.5, 2.325], [8.92, wallBase + 2.25, 5.2875], wainscotMat, 0.04, 3);
  addBox(rightWainscot, 'rightWainscotRearCap', [0.16, 0.16, 7.78], [8.92, wallBase + 4.56, -2.87], wainscotAccentMat, 0.025, 2);
  addBox(rightWainscot, 'rightWainscotFrontCap', [0.16, 0.16, 2.405], [8.92, wallBase + 4.56, 5.2875], wainscotAccentMat, 0.025, 2);
  for (let z = -5.45; z <= 0.7; z += 1.05) addBox(rightWainscot, `rightWainscotRearRail-${z.toFixed(2)}`, [0.08, 4.52, 0.14], [8.84, wallBase + 2.25, z], wainscotAccentMat, 0.025, 2);
  for (let z = 4.25; z <= 6.25; z += 1.0) addBox(rightWainscot, `rightWainscotFrontRail-${z.toFixed(2)}`, [0.08, 4.52, 0.14], [8.84, wallBase + 2.25, z], wainscotAccentMat, 0.025, 2);
  addCheckerSteps(rightWall, doorZ, doorWidth);

  const leftRaisedSign = new THREE.Group(); leftRaisedSign.name = 'leftRaisedSign'; leftRaisedSign.userData = { id: 'leftRaisedSign', connectedTo: 'backWall', verticalAdjustment: 0, width: 6.7, height: 2.2, leftEdgeX: -8.5 }; root.add(leftRaisedSign);
  addBox(leftRaisedSign, 'leftRaisedSignBack', [6.7, 1.9, 1.45], [-5.15, 14.25, -6.92], wallMat, 0.14, 5);
  addBox(leftRaisedSign, 'leftRaisedSignCap', [7.0, 0.42, 1.55], [-5.15, 15.08, -6.91], woodLight, 0.14, 5);
  addBox(leftRaisedSign, 'leftRaisedSignSideL', [0.42, 1.95, 1.55], [-8.5, 14.25, -6.91], woodLight, 0.11, 5);
  addBox(leftRaisedSign, 'leftRaisedSignSideR', [0.42, 1.95, 1.55], [-1.8, 14.25, -6.91], woodLight, 0.11, 5);
  addBox(leftRaisedSign, 'leftRaisedSignBase', [6.85, 0.26, 1.5], [-5.15, 13.25, -6.91], wood, 0.08, 4);
  const signWindow = new THREE.Group(); signWindow.name = 'signWindow'; signWindow.position.y = -0.225; signWindow.userData = { id: 'signWindow', replaceableTexture: 'assets/signs/sign-window.png', frontTexture: 'assets/signs/left-plaque-logo-transparent.png', approximate: true, verticalAdjustment: -0.225, centeredInRaisedPanel: true, background: 'dark-matte', crossDecorations: 'hidden-compatibility-nodes' }; leftRaisedSign.add(signWindow);
  addBox(signWindow, 'signWindowBack', [4.9, 1.05, 0.12], [-5.15, 14.35, -6.14], darkMat, 0.08, 4);
  addBox(signWindow, 'signWindowFrameTop', [5.1, 0.16, 0.22], [-5.15, 14.95, -6.0], wood, 0.04, 3);
  addBox(signWindow, 'signWindowFrameBottom', [5.1, 0.16, 0.22], [-5.15, 13.75, -6.0], wood, 0.04, 3);
  addBox(signWindow, 'signWindowFrameL', [0.16, 1.3, 0.22], [-7.62, 14.35, -6.0], wood, 0.04, 3);
  addBox(signWindow, 'signWindowFrameR', [0.16, 1.3, 0.22], [-2.68, 14.35, -6.0], wood, 0.04, 3);
  const signWindowIronV = addBox(signWindow, 'signWindowIronV', [0.12, 1.0, 0.12], [-5.15, 14.35, -5.86], ironMat, 0.03, 3);
  const signWindowIronH = addBox(signWindow, 'signWindowIronH', [2.0, 0.1, 0.12], [-5.15, 14.35, -5.86], ironMat, 0.03, 3);
  signWindowIronV.visible = false; signWindowIronH.visible = false;
  signWindowIronV.userData.compatibilityPlaceholder = true; signWindowIronH.userData.compatibilityPlaceholder = true;
  signWindow.userData.frontTexture = 'assets/signs/left-plaque-logo-transparent.png';
  signWindow.userData.frontTextureFit = 'contain';
  signWindow.userData.frontTextureOrientation = 'horizontal';
  addPlaqueFrontTexture(signWindow, 'signWindow', 'assets/signs/left-plaque-logo-transparent.png', 4.55, 1.0, 'signWindowBack', [-5.15, 14.35, -5.98], false);
  const leftPlaque = new THREE.Group(); leftPlaque.name = 'leftPlaque'; leftPlaque.position.set(-5.15, 13.1, -5.98); leftPlaque.userData = { id: 'leftPlaque', visible: false, compatibilityPlaceholder: true, replaceableTexture: 'assets/signs/left-plaque-logo-transparent.png', frontTexture: 'assets/signs/left-plaque-logo-transparent.png', frontTextureTarget: 'signWindow' }; leftRaisedSign.add(leftPlaque);
  // Keep the plaque's left edge at the raised-sign return, then run its right
  // edge to the inside face of the right wall. These explicit span values make
  // the intended wall alignment easy to maintain when the shell is resized.
  const rightLongPlaqueLeft = -2.3;
  const rightLongPlaqueRight = 9.0;
  const rightLongPlaqueWidth = rightLongPlaqueRight - rightLongPlaqueLeft;
  const rightLongPlaqueCenterX = (rightLongPlaqueLeft + rightLongPlaqueRight) / 2;
  const rightLongPlaque = addPlaque(backWallTopTrim, 'rightLongPlaque', [rightLongPlaqueWidth, 0.48, 0.2], [rightLongPlaqueCenterX, wallBase + 12.46, -6.48], plaqueMat); rightLongPlaque.userData.id = 'rightLongPlaque';
  rightLongPlaque.userData.span = { left: rightLongPlaqueLeft, right: rightLongPlaqueRight, alignedTo: 'rightWall.innerFace' };
  rightLongPlaque.userData.replaceableTexture = 'assets/signs/right-long-plaque-logo-transparent.png';
  rightLongPlaque.userData.frontTextureFit = 'contain';
  rightLongPlaque.userData.frontTextureOrientation = 'horizontal';
  addPlaqueFrontTexture(rightLongPlaque, 'rightLongPlaque', 'assets/signs/right-long-plaque-logo-transparent.png', rightLongPlaqueWidth, 0.48);
  const rightLongPlaqueUnderline = new THREE.Group(); rightLongPlaqueUnderline.name = 'rightLongPlaqueUnderline'; rightLongPlaqueUnderline.userData = { id: 'rightLongPlaqueUnderline', visible: false, compatibilityPlaceholder: true }; backWallTopTrim.add(rightLongPlaqueUnderline);

  root.userData.componentTree = ['backWall/backWallSolid/wainscot', 'roofTrim/backWallTopRail/rightLongPlaque/rightLongPlaqueUnderline', 'leftWall/leftWindow/wainscot', 'rightWall/doorFrame/door/wainscot/doorSteps', 'leftRaisedSign/signWindow/leftPlaque', 'baseFloor/floorSurface/floorPlankLines/baseCutout', 'baseTrim'];
  root.userData.wallThickness = 1;
  root.userData.leftWallLength = 6.3;
  root.userData.doorThickness = 1;
  root.userData.leftWindowOpening = true;
  root.userData.rearTopProfile = 'flat-except-left-raised-sign';
  root.userData.wainscotHeight = 4.5;
  root.userData.wainscotColor = '#A48670';
  root.userData.wainscotAccent = '#896B58';
  root.userData.wainscotRoughness = 0.84;
  root.userData.floorPattern = 'subtle-light-vertical-seams-and-staggered-horizontal-joints';
  root.userData.materialParams = { wall: { roughness: 0.88, metalness: 0 }, wood: { roughness: 0.82, metalness: 0 }, floor: { roughness: 0.86, metalness: 0 }, glass: { roughness: 0.35, metalness: 0.15 }, iron: { roughness: 0.45, metalness: 0.55 } };
  root.userData.roundingParams = { largeRadius: 0.12, largeBevelSegments: 5, smallRadius: 0.05, smallBevelSegments: 3 };
  root.traverse((object) => { if (object.isMesh) { object.userData.partId = object.name; object.userData.parentId = object.parent?.name || 'roomShell'; } });
  return root;
}

export { palette as ROOM_SHELL_PALETTE };
