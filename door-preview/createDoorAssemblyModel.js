import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEFAULTS = Object.freeze({
  width: 0.48,
  height: 1.53,
  depth: 0.07,
  frameWidth: 0.075,
  frameDepth: 0.085,
  stepWidth: 0.63,
  stepDepth: 0.36,
  seed: 17
});

function woodTexture(base = '#b86b26', grain = '#7b3f19', seed = 1) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d'); const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
    const wave = Math.sin((x + seed * 31) * 0.045 + Math.sin(y * 0.025) * 1.7) * 7;
    const n = Math.sin((x * 0.13 + y * 0.021 + seed) * 1.7) * 3 + wave;
    const rgb = parseInt(base.slice(1), 16); const br = (rgb >> 16) & 255; const bg = (rgb >> 8) & 255; const bb = rgb & 255; const i = (y * canvas.width + x) * 4;
    image.data[i] = Math.max(0, Math.min(255, br + n)); image.data[i + 1] = Math.max(0, Math.min(255, bg + n * .72)); image.data[i + 2] = Math.max(0, Math.min(255, bb + n * .48)); image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0); ctx.globalAlpha = .28; ctx.globalCompositeOperation = 'multiply';
  ctx.strokeStyle = grain; ctx.lineWidth = 1.4;
  for (let y = 16; y < 256; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(120, y - 7, 250, y + 9, 512, y - 3); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1.1, 1); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function rounded(width, height, depth, radius = 0.012) { return new RoundedBoxGeometry(width, height, depth, 5, Math.min(radius, width * .18, height * .18)); }
function mesh(parent, name, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) { const m = new THREE.Mesh(geometry, material); m.name = name; m.position.set(...position); m.rotation.set(...rotation); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function mat(color, roughness = .72, map = null, metalness = 0) { return new THREE.MeshStandardMaterial({ color, roughness, metalness, map }); }

function archGeometry(width, height, depth, radius = .02) {
  const shape = new THREE.Shape(); const w = width / 2; const spring = height * .54; const r = w;
  shape.moveTo(-w, -height / 2); shape.lineTo(w, -height / 2); shape.lineTo(w, spring - height / 2);
  shape.absarc(0, spring - height / 2, r, 0, Math.PI, false); shape.lineTo(-w, -height / 2); shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, bevelSize: radius, bevelThickness: radius * .55, curveSegments: 16 }); g.translate(0, 0, -depth / 2); return g;
}

function addArchFrame(parent, width, height, z, borderMaterial, mullionMaterial = borderMaterial) {
  const group = new THREE.Group(); group.name = 'doorGlassFrameDetails'; parent.add(group);
  const curve = new THREE.EllipseCurve(0, height * .04, width / 2, width / 2, 0, Math.PI, false, 0);
  const points = curve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, z));
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, .012, 8, false); mesh(group, 'doorGlassArchFrame', tube, borderMaterial);
  mesh(group, 'doorGlassMullionV', rounded(.022, height * .82, .022, .005), mullionMaterial, [0, -height * .03, z]);
  mesh(group, 'doorGlassMullionH', rounded(width * .82, .022, .022, .005), mullionMaterial, [0, -height * .13, z]);
  return group;
}

function addIronGrille(parent, width, height, z, material) {
  const group = new THREE.Group(); group.name = 'ironGrille'; parent.add(group);
  const addSwirl = (flip = 1) => {
    const pts = []; for (let i = 0; i <= 28; i += 1) { const t = i / 28; const x = flip * (width * .34 * (1 - t) + width * .08 * Math.sin(t * Math.PI * 2)); const y = height * .24 * Math.cos(t * Math.PI * 1.55) - height * .03; pts.push(new THREE.Vector3(x, y, z)); }
    mesh(group, `ironSwirl${flip < 0 ? 'L' : 'R'}`, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .009, 7, false), material);
  };
  addSwirl(-1); addSwirl(1);
  const addCurl = (side, verticalSign) => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(side * width * .05, verticalSign * height * .05, z),
      new THREE.Vector3(side * width * .28, verticalSign * height * .36, z),
      new THREE.Vector3(side * width * .38, -verticalSign * height * .28, z),
      new THREE.Vector3(side * width * .17, -verticalSign * height * .18, z)
    );
    mesh(group, `ironCurl${side < 0 ? 'L' : 'R'}${verticalSign < 0 ? 'Lower' : 'Upper'}`, new THREE.TubeGeometry(curve, 24, .0075, 7, false), material);
  };
  [-1, 1].forEach(side => { addCurl(side, 1); addCurl(side, -1); });
  mesh(group, 'ironGrilleCenterV', rounded(.012, height * .9, .018, .004), material, [0, 0, z]);
  mesh(group, 'ironGrilleCenterH', rounded(width * .86, .012, .018, .004), material, [0, 0, z]);
  [-1, 1].forEach(side => mesh(group, `ironGrilleSide${side < 0 ? 'L' : 'R'}`, rounded(.012, height * .68, .018, .004), material, [side * width * .42, 0, z]));
  return group;
}

function addCheckerTiles(parent, width, depth, y, z, tileMaterialA, tileMaterialB, prefix) {
  const group = new THREE.Group(); group.name = 'checkerTiles'; parent.add(group);
  const cols = 8; const rows = 3; const tw = (width * .92) / cols; const td = (depth * .88) / rows;
  for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
    const tile = mesh(group, `${prefix}Tile${row}_${col}`, rounded(tw * .96, .012, td * .96, .004), (row + col) % 2 ? tileMaterialA : tileMaterialB, [-(tw * cols) / 2 + tw * (col + .5), y, z - (td * rows) / 2 + td * (row + .5)]);
    tile.userData.tile = true;
  }
  return group;
}

export function createDoorAssemblyModel(options = {}) {
  const c = { ...DEFAULTS, ...options };
  const wood = mat(0xc77a2b, .66, woodTexture('#c77a2b', '#74401b', c.seed));
  const woodDark = mat(0x8c4b20, .78, woodTexture('#9b5825', '#603016', c.seed + 3));
  const purple = mat(0x4f3a92, .66);
  const purpleDark = mat(0x2b1d55, .82);
  const purpleMullion = mat(0x4b327f, .56);
  const black = mat(0x151416, .38, null, .12); black.side = THREE.DoubleSide;
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf6f4ef, roughness: .16, metalness: .04, transmission: .18, transparent: true, opacity: .9, side: THREE.DoubleSide });
  const gold = mat(0xc89426, .3, null, .55);
  const tileWhite = mat(0xf2eee4, .42); const tileBlack = mat(0x242225, .48);

  const doorAssembly = new THREE.Group(); doorAssembly.name = 'doorAssembly';
  doorAssembly.userData = { id: 'doorAssembly', dimensions: { width: c.width, height: c.height, depth: c.depth }, interactionIds: ['door-leaf', 'door-handle', 'step-upper', 'step-lower'] };

  const doorFrame = new THREE.Group(); doorFrame.name = 'doorFrame'; doorFrame.userData.partId = 'doorFrame'; doorAssembly.add(doorFrame);
  const doorBottom = .20; const doorTop = 1.24; const doorHeight = doorTop - doorBottom; const jambY = (doorBottom + 1.50) / 2; const jambHeight = 1.30;
  const leftJamb = mesh(doorFrame, 'leftJamb', rounded(c.frameWidth, jambHeight, c.frameDepth, .012), wood, [-c.width / 2 - c.frameWidth / 2, jambY, 0]); leftJamb.userData.partId = 'leftJamb';
  const rightJamb = mesh(doorFrame, 'rightJamb', rounded(c.frameWidth, jambHeight, c.frameDepth, .012), wood, [c.width / 2 + c.frameWidth / 2, jambY, 0]); rightJamb.userData.partId = 'rightJamb';
  const topBeam = mesh(doorFrame, 'topBeam', rounded(c.width + c.frameWidth * 2.3, c.frameWidth * 1.18, c.frameDepth, .014), wood, [0, 1.53, 0]); topBeam.userData.partId = 'topBeam';
  mesh(doorFrame, 'transomSill', rounded(c.width + .018, .055, c.frameDepth * .92, .009), wood, [0, 1.255, 0]);

  const transomWindow = new THREE.Group(); transomWindow.name = 'transomWindow'; transomWindow.userData.partId = 'transomWindow'; doorAssembly.add(transomWindow);
  mesh(transomWindow, 'transomFrameTop', rounded(c.width * .86, .025, .035, .006), black, [0, 1.485, .005]);
  mesh(transomWindow, 'transomFrameBottom', rounded(c.width * .86, .025, .035, .006), black, [0, 1.275, .005]);
  mesh(transomWindow, 'transomFrameLeft', rounded(.025, .22, .035, .006), black, [-c.width * .43, 1.38, .005]);
  mesh(transomWindow, 'transomFrameRight', rounded(.025, .22, .035, .006), black, [c.width * .43, 1.38, .005]);
  mesh(transomWindow, 'transomGlass', rounded(c.width * .78, .18, .025, .012), glass, [0, 1.38, .028]);
  const transomGrille = addIronGrille(transomWindow, c.width * .72, .15, .048, black); transomGrille.position.y = 1.38;

  const doorLeaf = new THREE.Group(); doorLeaf.name = 'doorLeaf'; doorLeaf.userData = { interactionId: 'door-leaf', interactive: 'door', label: '门体' }; doorAssembly.add(doorLeaf);
  doorLeaf.position.y = doorBottom;
  mesh(doorLeaf, 'doorLeafBody', rounded(c.width, .53, c.depth, .018), purple, [0, .265, 0]);
  mesh(doorLeaf, 'doorLeafUpperLeft', rounded(.095, .53, c.depth, .014), purple, [-c.width * .424, .78, 0]);
  mesh(doorLeaf, 'doorLeafUpperRight', rounded(.095, .53, c.depth, .014), purple, [c.width * .424, .78, 0]);
  mesh(doorLeaf, 'doorLeafUpperTop', rounded(c.width, .095, c.depth, .014), purple, [0, doorHeight - .0475, 0]);
  const doorGlass = new THREE.Group(); doorGlass.name = 'doorGlass'; doorGlass.userData.partId = 'doorGlass'; doorLeaf.add(doorGlass);
  mesh(doorGlass, 'doorGlassPane', archGeometry(c.width * .72, .53, .026, .008), glass, [0, .73, c.depth / 2 + .012]);
  const doorArchFrame = addArchFrame(doorGlass, c.width * .72, .53, c.depth / 2 + .03, black, purpleMullion); doorArchFrame.position.y = .73;
  const doorArchFrameRear = addArchFrame(doorGlass, c.width * .72, .53, -c.depth / 2 - .03, black, purpleMullion); doorArchFrameRear.name = 'doorGlassFrameRear'; doorArchFrameRear.position.y = .73;
  mesh(doorGlass, 'doorGlassPaneRear', archGeometry(c.width * .72, .53, .026, .008), glass, [0, .73, -c.depth / 2 - .012]);
  const doorPanels = new THREE.Group(); doorPanels.name = 'doorPanels'; doorPanels.userData.partId = 'doorPanels'; doorLeaf.add(doorPanels);
  mesh(doorPanels, 'doorPanelUpperRail', rounded(c.width * .82, .045, .026, .006), purpleDark, [0, .48, c.depth / 2 + .01]);
  mesh(doorPanels, 'doorPanelLowerRail', rounded(c.width * .82, .045, .026, .006), purpleDark, [0, .43, c.depth / 2 + .01]);
  mesh(doorPanels, 'doorPanelInset', rounded(c.width * .66, .34, .018, .012), purpleDark, [0, .23, c.depth / 2 + .012]);
  mesh(doorPanels, 'doorPanelInsetInner', rounded(c.width * .58, .27, .012, .009), purple, [0, .23, c.depth / 2 + .024]);
  mesh(doorPanels, 'doorPanelUpperRailRear', rounded(c.width * .82, .045, .026, .006), purpleDark, [0, .48, -c.depth / 2 - .01]);
  mesh(doorPanels, 'doorPanelLowerRailRear', rounded(c.width * .82, .045, .026, .006), purpleDark, [0, .43, -c.depth / 2 - .01]);
  mesh(doorPanels, 'doorPanelInsetRear', rounded(c.width * .66, .34, .018, .012), purpleDark, [0, .23, -c.depth / 2 - .012]);
  mesh(doorPanels, 'doorPanelInsetInnerRear', rounded(c.width * .58, .27, .012, .009), purple, [0, .23, -c.depth / 2 - .024]);

  const handle = new THREE.Group(); handle.name = 'handle'; handle.userData = { interactionId: 'door-handle', interactive: 'door-handle', label: '金色门把手' }; doorAssembly.add(handle);
  const handleY = .74;
  mesh(handle, 'handleBackplate', rounded(.035, .25, .024, .009), gold, [c.width * .28, handleY, c.depth / 2 + .035]);
  mesh(handle, 'handleBar', new THREE.TorusGeometry(.055, .009, 8, 20, Math.PI), gold, [c.width * .32, handleY, c.depth / 2 + .058], [Math.PI / 2, 0, Math.PI / 2]);
  mesh(handle, 'handleLatch', rounded(.11, .018, .018, .006), gold, [c.width * .24, handleY, c.depth / 2 + .06]);
  mesh(handle, 'handleBackplateRear', rounded(.035, .22, .024, .009), gold, [-c.width * .28, handleY, -c.depth / 2 - .035]);
  mesh(handle, 'handleLatchRear', rounded(.11, .018, .018, .006), gold, [-c.width * .24, handleY, -c.depth / 2 - .06]);
  const hinges = new THREE.Group(); hinges.name = 'hinges'; hinges.userData.partId = 'hinges'; doorAssembly.add(hinges);
  [.34, 1.02].forEach((y, i) => mesh(hinges, `hinge${i + 1}`, rounded(.035, .12, .026, .006), gold, [-c.width / 2 - .008, y, c.depth / 2 + .035]));

  const stepLower = mesh(doorAssembly, 'stepLower', rounded(c.stepWidth, .12, c.stepDepth, .035), woodDark, [0, .06, .19]); stepLower.userData = { interactionId: 'step-lower', interactive: 'step', label: '下级台阶' };
  const stepUpper = mesh(doorAssembly, 'stepUpper', rounded(c.stepWidth * .9, .11, c.stepDepth * .72, .03), woodDark, [0, .16, .08]); stepUpper.userData = { interactionId: 'step-upper', interactive: 'step', label: '上级台阶' };
  addCheckerTiles(stepLower, c.stepWidth, c.stepDepth, .066, 0, tileWhite, tileBlack, 'lower');
  addCheckerTiles(stepUpper, c.stepWidth * .9, c.stepDepth * .72, .061, 0, tileWhite, tileBlack, 'upper');

  doorAssembly.traverse(obj => { obj.userData.modelId = 'doorAssembly'; if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; } });
  doorAssembly.userData.interactionObjects = ['doorLeaf', 'handle', 'stepUpper', 'stepLower'];
  return doorAssembly;
}

export { DEFAULTS as DOOR_ASSEMBLY_DIMENSIONS };
