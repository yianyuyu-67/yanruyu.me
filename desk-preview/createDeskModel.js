import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const palette = {
  wood: 0x7a422f,
  woodLight: 0xa9653f,
  woodDark: 0x4f2f26,
  seam: 0x5b352b,
  gold: 0xb8894b,
  floor: 0x996047
};

function roundedPart(name, size, position, material, radius = 0.08, segments = 4) {
  const [w, h, d] = size;
  const geometry = new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, Math.min(w, h, d) * 0.45));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeMaterial(color, roughness = 0.78, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export function createDeskModel() {
  const desk = new THREE.Group();
  desk.name = 'desk';
  desk.userData.sculptRuntime = { coordinateFrame: { front: '+Z', up: '+Y', origin: 'bottom-center' }, dimensions: { width: 10.2, depth: 6.0, height: 7.8 }, explodable: true, clickable: true };

  const wood = makeMaterial(palette.wood);
  const woodLight = makeMaterial(palette.woodLight);
  const woodDark = makeMaterial(palette.woodDark);
  const seam = makeMaterial(palette.seam, 0.86);
  const gold = makeMaterial(palette.gold, 0.3, 0.75);

  const desktop = new THREE.Group(); desktop.name = 'desktop'; desk.add(desktop);
  desktop.add(roundedPart('desktopSlab', [10.2, 0.65, 6.0], [0, 7.475, 0], woodLight, 0.14, 6));
  desktop.userData.dimensions = { width: 10.2, depth: 6, height: 0.65 };

  const leftTower = new THREE.Group(); leftTower.name = 'leftDrawerTower'; leftTower.position.set(-3.75, 0, 0); desk.add(leftTower);
  const rightTower = new THREE.Group(); rightTower.name = 'rightDrawerTower'; rightTower.position.set(3.75, 0, 0); desk.add(rightTower);
  const towerBody = [2.35, 6.35, 5.35];
  for (const tower of [leftTower, rightTower]) {
    tower.add(roundedPart(`${tower.name}-body`, towerBody, [0, 3.625, 0], wood, 0.11, 5));
    tower.add(roundedPart(`${tower.name}-plinth`, [2.55, 0.42, 5.55], [0, 0.24, 0], woodDark, 0.08, 4));
    // The top rail overlaps the desktop underside by 0.02 units so the tower reads as one tight assembly.
    tower.add(roundedPart(`${tower.name}-topRail`, [2.5, 0.38, 5.45], [0, 6.98, 0], woodLight, 0.06, 4));
  }

  const drawerYs = [1.65, 3.3, 4.95];
  let pullIndex = 1;
  for (const [tower, side] of [[leftTower, 'left'], [rightTower, 'right']]) {
    for (let i = 0; i < 3; i++) {
      const drawer = new THREE.Group(); drawer.name = `${side}Drawer${i + 1}`; drawer.position.set(0, drawerYs[i], 2.73); tower.add(drawer);
      drawer.add(roundedPart(`${side}Drawer${i + 1}Front`, [2.08, 1.42, 0.18], [0, 0, 0], woodLight, 0.07, 4));
      drawer.add(roundedPart(`${side}Drawer${i + 1}Reveal`, [1.9, 0.08, 0.03], [0, -0.69, 0.105], seam, 0.02, 2));
      for (const x of [-0.52, 0.52]) {
        const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 12), gold);
        pull.name = `drawerPull${pullIndex++}`;
        pull.rotation.z = Math.PI / 2;
        pull.position.set(x, 0, 0.15);
        pull.castShadow = true; pull.receiveShadow = true;
        drawer.add(pull);
      }
    }
  }

  const centerDrawer = new THREE.Group(); centerDrawer.name = 'centerUpperDrawer'; centerDrawer.position.set(0, 6.58, 0); desk.add(centerDrawer);
  centerDrawer.add(roundedPart('centerDrawerFront', [4.72, 1.2, 0.2], [0, 0, 2.73], woodLight, 0.08, 5));
  centerDrawer.add(roundedPart('centerDrawerReveal', [4.5, 0.08, 0.03], [0, -0.6, 2.84], seam, 0.02, 2));
  const centerPull = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.9, 12), gold); centerPull.name = 'centerDrawerPull'; centerPull.rotation.z = Math.PI / 2; centerPull.position.set(0, 0, 2.9); centerDrawer.add(centerPull);

  const supportSystem = new THREE.Group(); supportSystem.name = 'supportSystem'; desk.add(supportSystem);
  supportSystem.add(roundedPart('frontApron', [4.85, 0.42, 0.45], [0, 6.72, 2.42], woodDark, 0.06, 4));
  supportSystem.add(roundedPart('lowerRail', [4.85, 0.38, 0.5], [0, 0.76, 2.38], woodDark, 0.06, 4));
  const supports = [[-2.2, 2.55], [2.2, 2.55], [-2.2, -2.35], [2.2, -2.35]];
  supports.forEach(([x, z], i) => supportSystem.add(roundedPart(`support${i + 1}`, [0.42, 5.35, 0.46], [x, 3.8, z], wood, 0.06, 4)));

  desk.traverse((o) => { if (o.isMesh) { o.userData.partId = o.name; o.userData.explodeWithParent = true; } });
  return desk;
}

export const DESK_PALETTE = palette;
