import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LUGGAGE_DIMENSIONS = Object.freeze({ width: 3.35, depth: 2.25, height: 3.85, units: 'scene' });

const leather = new THREE.MeshStandardMaterial({ color: 0x5a2e21, roughness: 0.72, metalness: 0.02 });
const leatherDark = new THREE.MeshStandardMaterial({ color: 0x321914, roughness: 0.8, metalness: 0.02 });
const leatherEdge = new THREE.MeshStandardMaterial({ color: 0x7a422b, roughness: 0.68, metalness: 0.02 });
const brass = new THREE.MeshStandardMaterial({ color: 0xb18445, roughness: 0.42, metalness: 0.62 });
const brassDark = new THREE.MeshStandardMaterial({ color: 0x6f4e2d, roughness: 0.5, metalness: 0.58 });

function finish(mesh, id, userData = {}) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { componentId: id, ...userData };
  return mesh;
}

function roundedBox(parent, id, size, position, material, radius = 0.1, rotation = [0, 0, 0], userData = {}) {
  const geometry = new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(radius, Math.min(...size) / 5));
  const mesh = finish(new THREE.Mesh(geometry, material), id, userData);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, id, radius, depth, position, material, rotation = [0, 0, 0], radialSegments = 12) {
  const mesh = finish(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, radialSegments), material), id);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function makeHandle(parent, id, width, y, z, material) {
  const handle = new THREE.Group();
  handle.name = id;
  handle.userData = { componentId: id, animationRole: 'static-handle', explodeWithParent: true };
  parent.add(handle);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-width / 2, 0, 0),
    new THREE.Vector3(-width * 0.38, 0.38, 0),
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(width * 0.38, 0.38, 0),
    new THREE.Vector3(width / 2, 0, 0)
  ]);
  const tube = finish(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.12, 8, false), material), `${id}Grip`, { explodeWithParent: true });
  tube.position.set(0, y, z);
  handle.add(tube);
  cylinder(handle, `${id}LeftMount`, 0.16, 0.22, [-width / 2, y, z], brassDark, [Math.PI / 2, 0, 0]);
  cylinder(handle, `${id}RightMount`, 0.16, 0.22, [width / 2, y, z], brassDark, [Math.PI / 2, 0, 0]);
  return handle;
}

function addStrap(parent, id, width, height, depth, position, rotation = [0, 0, 0]) {
  return roundedBox(parent, id, [width, height, depth], position, leatherDark, 0.035, rotation, { materialRole: 'leather-strap', explodeWithParent: true });
}

function addRivets(parent, prefix, positions, z = 1.15) {
  positions.forEach(([x, y]) => cylinder(parent, `${prefix}-${x}-${y}`, 0.055, 0.045, [x, y, z], brass, [Math.PI / 2, 0, 0], 10));
}

export function createLuggageModel() {
  const root = new THREE.Group();
  root.name = 'luggage';
  root.userData = {
    id: 'luggage',
    coordinateFrame: { front: '+Z', up: '+Y', origin: 'lower case floor center', bottomY: 0 },
    dimensions: LUGGAGE_DIMENSIONS,
    nonInteractive: true,
    sculptRuntime: {
      nodes: ['luggageLowerCase', 'luggageUpperCase', 'luggageStraps', 'luggageHardware', 'luggageHandles', 'luggageCollider'],
      destructionGroups: { 'stacked-cases': ['luggageLowerCase', 'luggageUpperCase'] },
      colliders: ['luggageCollider'],
      animationAnchors: { lowerCase: 'luggageLowerCase', upperCase: 'luggageUpperCase', handle: 'luggageHandles' }
    },
    approximationNotes: ['rear hinges, underside lining and interior compartments are inferred from one three-quarter reference', 'aged leather grain is represented by low-contrast PBR variation']
  };

  const lower = new THREE.Group();
  lower.name = 'luggageLowerCase';
  lower.userData = { componentId: 'luggageLowerCase', role: 'horizontal suitcase', animationRole: 'static-part' };
  root.add(lower);
  roundedBox(lower, 'luggageLowerBody', [3.35, 1.25, 2.25], [0, 0.68, 0], leather, 0.16, [0, 0, 0], { materialRole: 'aged-leather-shell' });
  roundedBox(lower, 'luggageLowerLid', [3.28, 0.16, 2.18], [0, 1.34, -0.02], leatherEdge, 0.08, [0, 0, 0], { materialRole: 'leather-lid' });
  const lowerTrim = new THREE.Group(); lowerTrim.name = 'luggageLowerTrim'; lowerTrim.userData = { componentId: 'luggageLowerTrim', explodeWithParent: true }; lower.add(lowerTrim);
  addStrap(lowerTrim, 'luggageLowerStrapCenter', 0.22, 1.42, 0.07, [0, 0.68, 1.14]);
  addStrap(lowerTrim, 'luggageLowerStrapLeft', 0.2, 1.42, 0.07, [-1.15, 0.68, 1.14]);
  addStrap(lowerTrim, 'luggageLowerStrapRight', 0.2, 1.42, 0.07, [1.15, 0.68, 1.14]);
  addStrap(lowerTrim, 'luggageLowerFrontRail', 3.08, 0.12, 0.08, [0, 0.22, 1.14]);
  addStrap(lowerTrim, 'luggageLowerTopRail', 3.08, 0.1, 0.08, [0, 1.26, 1.14]);
  makeHandle(lower, 'luggageLowerHandle', 0.95, 0.66, 1.2, leatherDark);
  const lowerHardware = new THREE.Group(); lowerHardware.name = 'luggageLowerHardware'; lowerHardware.userData = { componentId: 'luggageHardware', explodeWithParent: true }; lower.add(lowerHardware);
  [-1.15, 1.15].forEach((x, index) => {
    roundedBox(lowerHardware, `luggageLowerClasp${index + 1}`, [0.28, 0.42, 0.12], [x, 1.05, 1.18], brassDark, 0.04);
    cylinder(lowerHardware, `luggageLowerClaspPin${index + 1}`, 0.07, 0.06, [x, 1.05, 1.27], brass, [Math.PI / 2, 0, 0], 10);
  });
  addRivets(lowerHardware, 'lower-rivet', [[-1.48, 0.25], [-1.48, 1.08], [1.48, 0.25], [1.48, 1.08], [-0.58, 0.22], [0.58, 0.22]]);

  const upper = new THREE.Group();
  upper.name = 'luggageUpperCase';
  upper.position.set(0, 1.38, -0.03);
  upper.userData = { componentId: 'luggageUpperCase', role: 'upright suitcase', animationRole: 'static-part' };
  root.add(upper);
  roundedBox(upper, 'luggageUpperBody', [3.08, 2.28, 1.18], [0, 1.18, 0], leather, 0.14, [0, 0, 0], { materialRole: 'aged-leather-shell' });
  roundedBox(upper, 'luggageUpperLid', [3.0, 0.15, 1.12], [0, 2.36, 0], leatherEdge, 0.07);
  const upperTrim = new THREE.Group(); upperTrim.name = 'luggageUpperTrim'; upperTrim.userData = { componentId: 'luggageUpperTrim', explodeWithParent: true }; upper.add(upperTrim);
  addStrap(upperTrim, 'luggageUpperStrapCenter', 0.22, 2.26, 0.07, [0, 1.18, 0.62]);
  addStrap(upperTrim, 'luggageUpperStrapLeft', 0.2, 2.26, 0.07, [-1.12, 1.18, 0.62]);
  addStrap(upperTrim, 'luggageUpperStrapRight', 0.2, 2.26, 0.07, [1.12, 1.18, 0.62]);
  addStrap(upperTrim, 'luggageUpperBottomRail', 2.86, 0.1, 0.08, [0, 0.12, 0.62]);
  addStrap(upperTrim, 'luggageUpperTopRail', 2.86, 0.1, 0.08, [0, 2.24, 0.62]);
  addStrap(upperTrim, 'luggageUpperSideRailL', 0.1, 2.1, 0.08, [-1.48, 1.18, 0.62]);
  addStrap(upperTrim, 'luggageUpperSideRailR', 0.1, 2.1, 0.08, [1.48, 1.18, 0.62]);
  makeHandle(upper, 'luggageUpperHandle', 1.08, 2.48, 0.62, leatherDark);
  const upperHardware = new THREE.Group(); upperHardware.name = 'luggageUpperHardware'; upperHardware.userData = { componentId: 'luggageHardware', explodeWithParent: true }; upper.add(upperHardware);
  [-1.12, 1.12].forEach((x, index) => {
    roundedBox(upperHardware, `luggageUpperClasp${index + 1}`, [0.27, 0.36, 0.12], [x, 0.35, 0.68], brassDark, 0.04);
    cylinder(upperHardware, `luggageUpperClaspPin${index + 1}`, 0.065, 0.055, [x, 0.35, 0.77], brass, [Math.PI / 2, 0, 0], 10);
  });
  addRivets(upperHardware, 'upper-rivet', [[-1.36, 0.2], [-1.36, 2.15], [1.36, 0.2], [1.36, 2.15], [-0.56, 0.18], [0.56, 0.18]], 0.7);

  const handles = new THREE.Group(); handles.name = 'luggageHandles'; handles.userData = { componentId: 'luggageHandles', animationRole: 'handle', pivotAxis: 'Y' }; root.add(handles);
  // Handle meshes remain parented to their case so their local pivots stay aligned;
  // this named group is the stable animation/query anchor for future controls.

  const hardware = new THREE.Group(); hardware.name = 'luggageHardware'; hardware.userData = { componentId: 'luggageHardware', explodeWithParent: true }; root.add(hardware);

  const collider = new THREE.Mesh(new THREE.BoxGeometry(3.42, 3.9, 2.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  collider.name = 'luggageCollider'; collider.position.set(0, 1.93, 0); collider.visible = false; collider.userData = { componentId: 'luggageCollider', isCollider: true, nonInteractive: true }; root.add(collider);
  root.traverse(object => { object.userData.nonInteractive = true; if (object.isMesh) object.raycast = () => null; });
  root.updateMatrixWorld(true);
  return root;
}
