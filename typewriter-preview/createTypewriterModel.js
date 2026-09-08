import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const TYPEWRITER_DIMENSIONS = Object.freeze({ width: 6.8, depth: 5.4, height: 4.6 });

const palette = {
  shell: 0x76a48b,
  shellDark: 0x527e6b,
  ivory: 0xece4ca,
  metal: 0xb9ae91,
  metalDark: 0x6f746e,
  ribbon: 0x273a34,
  paper: 0xf1e7cf,
  trim: 0xd1c6a6,
};

function mat(color, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const materials = {
  shell: mat(palette.shell, 0.78),
  shellDark: mat(palette.shellDark, 0.82),
  ivory: mat(palette.ivory, 0.88),
  metal: mat(palette.metal, 0.38, 0.5),
  metalDark: mat(palette.metalDark, 0.5, 0.28),
  ribbon: mat(palette.ribbon, 0.9),
  paper: mat(palette.paper, 0.92),
  trim: mat(palette.trim, 0.5, 0.22),
};

function rounded(name, size, position, material, radius = 0.12, segments = 5) {
  const geometry = new RoundedBoxGeometry(size[0], size[1], size[2], segments, Math.min(radius, Math.min(size[0], size[1], size[2]) * 0.45));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(name, radius, length, position, material, rotation = [0, 0, 0], radialSegments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, radialSegments), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addKeyCaps(keyRows, keyCaps) {
  const keyCapsGroup = new THREE.Group();
  keyCapsGroup.name = 'keyCaps';
  keyRows.add(keyCapsGroup);
  const rows = [
    { y: 1.50, z: 3.12, offset: -2.48, count: 10 },
    { y: 1.82, z: 2.66, offset: -2.48, count: 10 },
    { y: 2.14, z: 2.28, offset: -2.48, count: 10 },
  ];
  let index = 1;
  rows.forEach((row, r) => {
    const group = new THREE.Group();
    group.name = `keyRow${r + 1}`;
    group.position.y = 0;
    keyCapsGroup.add(group);
    for (let c = 0; c < row.count; c += 1) {
      const key = rounded(`keyCap${index}`, [0.42, 0.22, 0.42], [row.offset + c * 0.55, row.y, row.z], materials.ivory, 0.06, 3);
      key.userData.replaceable = true;
      key.userData.letterIndex = index;
      group.add(key);
      keyCaps.push(key);
      index += 1;
    }
  });
  const space = rounded('spaceBar', [2.55, 0.22, 0.44], [0, 1.24, 3.42], materials.ivory, 0.09, 4);
  space.userData.replaceable = true;
      keyCapsGroup.add(space);
}

export function createTypewriterModel() {
  const root = new THREE.Group();
  root.name = 'typewriter';
  root.userData = {
    id: 'typewriter',
    coordinateFrame: 'front +Z, up +Y, bottom y=0',
    dimensions: TYPEWRITER_DIMENSIONS,
    sculptRuntime: {
      clickable: true,
      pivot: { position: [0, 0, 0], rotation: [0, 0, 0] },
      sockets: ['keyboardMount', 'platenMount', 'mechanismMount'],
      replaceableParts: ['keyCaps', 'paperSheet', 'ribbon'],
    },
  };

  const bodyShell = new THREE.Group(); bodyShell.name = 'bodyShell'; root.add(bodyShell);
  const baseTrim = new THREE.Group(); baseTrim.name = 'baseTrim'; root.add(baseTrim);
  const topHousing = new THREE.Group(); topHousing.name = 'topHousing'; root.add(topHousing);
  const frontHousing = new THREE.Group(); frontHousing.name = 'frontHousing'; bodyShell.add(frontHousing);
  const keyboardDeck = new THREE.Group(); keyboardDeck.name = 'keyboardDeck'; root.add(keyboardDeck);
  const keyRows = new THREE.Group(); keyRows.name = 'keyRows'; root.add(keyRows);
  const keyCaps = [];
  keyRows.userData.keyCaps = keyCaps;
  const platenAssembly = new THREE.Group(); platenAssembly.name = 'platenAssembly'; root.add(platenAssembly);
  const mechanism = new THREE.Group(); mechanism.name = 'mechanism'; root.add(mechanism);

  // Layered, tapered toy-like base and shell volumes.
  baseTrim.add(rounded('baseLower', [6.95, 0.22, 5.25], [0, 0.11, 0], materials.trim, 0.16, 5));
  baseTrim.add(rounded('baseUpper', [6.72, 0.24, 5.05], [0, 0.30, 0], materials.shellDark, 0.14, 5));
  bodyShell.add(rounded('shellLower', [6.55, 1.45, 4.85], [0, 1.05, 0], materials.shell, 0.30, 6));
  // Low, continuous apron: overlaps the lower shell but stays below the forward space bar.
  bodyShell.add(rounded('keyboardSupportApron', [6.35, 0.44, 1.25], [0, 0.77, 2.95], materials.shell, 0.18, 4));
  bodyShell.add(rounded('shellUpper', [6.15, 1.45, 4.25], [0, 2.15, -0.18], materials.shell, 0.30, 6));
  frontHousing.add(rounded('frontLip', [6.18, 0.48, 0.72], [0, 2.60, 1.95], materials.shellDark, 0.16, 5));
  topHousing.add(rounded('topHousingShell', [5.90, 0.82, 3.25], [0, 3.30, -0.18], materials.shell, 0.28, 6));

  // Sloped keyboard deck (front is +Z).
  const deck = rounded('keyboardDeckSurface', [5.75, 0.32, 2.55], [0, 1.78, 1.25], materials.shellDark, 0.14, 5);
  deck.rotation.x = -0.14;
  keyboardDeck.add(deck);
  addKeyCaps(keyRows, keyCaps);

  const spaceBar = keyRows.getObjectByName('spaceBar');
  spaceBar.rotation.x = -0.14;

  const platenRoller = cylinder('platenRoller', 0.30, 5.55, [0, 4.04, -1.26], materials.metalDark, [0, 0, Math.PI / 2], 28);
  platenAssembly.add(platenRoller);
  const platenKnobs = new THREE.Group(); platenKnobs.name = 'platenKnobs'; platenAssembly.add(platenKnobs);
  platenKnobs.add(cylinder('platenKnobLeft', 0.43, 0.18, [-2.88, 4.04, -1.26], materials.metal, [0, 0, Math.PI / 2], 24));
  platenKnobs.add(cylinder('platenKnobRight', 0.43, 0.18, [2.88, 4.04, -1.26], materials.metal, [0, 0, Math.PI / 2], 24));
  const carriageRail = cylinder('carriageRail', 0.075, 5.90, [0, 4.36, -1.42], materials.metal, [0, 0, Math.PI / 2], 16);
  platenAssembly.add(carriageRail);
  const paperGuide = new THREE.Group(); paperGuide.name = 'paperGuide'; platenAssembly.add(paperGuide);
  paperGuide.add(rounded('paperGuideLeft', [0.16, 0.72, 0.18], [-2.18, 3.86, -0.93], materials.metal, 0.05, 3));
  paperGuide.add(rounded('paperGuideRight', [0.16, 0.72, 0.18], [2.18, 3.86, -0.93], materials.metal, 0.05, 3));
  const paperSheet = rounded('paperSheet', [4.10, 1.45, 0.055], [0, 4.72, -1.08], materials.paper, 0.02, 2);
  paperSheet.userData.replaceable = true;
  paperSheet.rotation.x = -0.06;
  platenAssembly.add(paperSheet);

  const carriageReturnLever = new THREE.Group(); carriageReturnLever.name = 'carriageReturnLever'; platenAssembly.add(carriageReturnLever);
  carriageReturnLever.add(cylinder('leverStem', 0.09, 1.15, [2.62, 4.58, -0.62], materials.metal, [0, 0, -0.18], 16));
  carriageReturnLever.add(rounded('leverGrip', [0.22, 0.18, 0.44], [2.50, 5.10, -0.48], materials.metal, 0.07, 3));

  const ribbonSpools = new THREE.Group(); ribbonSpools.name = 'ribbonSpools'; mechanism.add(ribbonSpools);
  ribbonSpools.add(cylinder('ribbonSpoolLeft', 0.28, 0.12, [-1.32, 3.18, -0.15], materials.metal, [Math.PI / 2, 0, 0], 20));
  ribbonSpools.add(cylinder('ribbonSpoolRight', 0.28, 0.12, [1.32, 3.18, -0.15], materials.metal, [Math.PI / 2, 0, 0], 20));
  const ribbon = rounded('ribbon', [2.45, 0.07, 0.06], [0, 3.16, -0.16], materials.ribbon, 0.02, 2); ribbon.userData.replaceable = true; mechanism.add(ribbon);
  const typeBars = new THREE.Group(); typeBars.name = 'typeBars'; mechanism.add(typeBars);
  for (let i = -4; i <= 4; i += 1) {
    const bar = cylinder(`typeBar${i + 5}`, 0.035, 0.88, [i * 0.22, 2.98, 0.18 + Math.abs(i) * 0.02], materials.metal, [0.22 * i, 0, 0], 10);
    typeBars.add(bar);
  }

  mechanism.add(rounded('mechanismBridge', [3.8, 0.12, 0.20], [0, 3.03, 0.18], materials.metalDark, 0.04, 3));
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}

export const TYPEWRITER_MATERIALS = materials;
