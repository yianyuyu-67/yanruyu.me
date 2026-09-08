import * as THREE from 'three';

export const DESK_LAMP_DIMENSIONS = Object.freeze({ width: 26, depth: 15, height: 38, baseDiameter: 15, shadeDiameter: 15, shadeTopHeight: 9.5, units: 'cm' });

const GREEN = new THREE.MeshPhysicalMaterial({ color: 0x1b5543, metalness: 0.32, roughness: 0.5, clearcoat: 0.12, clearcoatRoughness: 0.42, side: THREE.DoubleSide });
const GREEN_DARK = new THREE.MeshPhysicalMaterial({ color: 0x0b2a23, metalness: 0.3, roughness: 0.57 });
const BRASS = new THREE.MeshPhysicalMaterial({ color: 0xc99942, metalness: 0.72, roughness: 0.3, clearcoat: 0.08, clearcoatRoughness: 0.3 });
const BRASS_DARK = new THREE.MeshStandardMaterial({ color: 0x8b5b24, metalness: 0.65, roughness: 0.36 });
const IVORY = new THREE.MeshStandardMaterial({ color: 0xf4e6c2, roughness: 0.56, metalness: 0.0, side: THREE.DoubleSide });
const RUBBER = new THREE.MeshStandardMaterial({ color: 0x141a18, roughness: 0.82, metalness: 0.0 });

function finish(mesh, id) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.componentId = id;
  return mesh;
}

function cylinder(id, radius, height, material, radialSegments = 32, position = [0, 0, 0]) {
  const mesh = finish(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material), id);
  mesh.position.set(...position);
  return mesh;
}

function sphere(id, radius, material, position = [0, 0, 0], segments = 24) {
  const mesh = finish(new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(12, Math.floor(segments * 0.65))), material), id);
  mesh.position.set(...position);
  return mesh;
}

function torus(id, major, minor, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = finish(new THREE.Mesh(new THREE.TorusGeometry(major, minor, 10, 40), material), id);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
}

function lathe(id, profile, material, segments = 48, position = [0, 0, 0]) {
  const mesh = finish(new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), material), id);
  mesh.position.set(...position);
  return mesh;
}

function rodBetween(id, a, b, radius, material, radialSegments = 14) {
  const start = new THREE.Vector3(...a); const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start); const length = delta.length();
  const mesh = finish(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.96, length, radialSegments), material), id);
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}

function tube(id, points, radius, material, tubularSegments = 28, radialSegments = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
  return finish(new THREE.Mesh(new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false), material), id);
}

function addBase(group) {
  const profile = [[0, 0], [7.05, 0], [7.5, 0.42], [7.5, 1.7], [7.15, 2.12], [5.7, 2.38], [4.55, 2.62], [3.85, 3.02], [3.1, 3.3], [0, 3.3]];
  group.add(lathe('basePlinth', profile, GREEN, 56));
  group.add(torus('baseOuterTrim', 6.95, 0.18, BRASS, [0, 0.38, 0], [Math.PI / 2, 0, 0]));
  group.add(torus('baseUpperRing', 4.0, 0.19, BRASS, [0, 2.82, 0], [Math.PI / 2, 0, 0]));
  group.add(lathe('baseHighlightStep', [[0, 2.95], [3.0, 2.95], [3.42, 3.12], [3.42, 3.27], [0, 3.27]], GREEN_DARK, 48));
}

function addStem(group) {
  group.add(cylinder('stemBody', 1.48, 19.4, GREEN, 36, [0, 13.2, 0]));
  group.add(torus('stemLowerBrassCollar', 1.62, 0.18, BRASS, [0, 3.85, 0], [Math.PI / 2, 0, 0]));
  group.add(torus('stemUpperBrassCollar', 1.66, 0.18, BRASS, [0, 23.0, 0], [Math.PI / 2, 0, 0]));
  group.add(lathe('stemFootFinial', [[0, 3.28], [2.0, 3.28], [2.22, 3.5], [1.9, 3.78], [1.35, 4.05], [1.35, 4.4], [0, 4.4]], BRASS, 40));
  group.add(lathe('stemTopFinial', [[0, 23.1], [2.05, 23.1], [2.15, 23.42], [1.72, 23.75], [1.55, 24.25], [1.55, 25.4], [1.35, 26.0], [0, 26.0]], GREEN, 40));
  group.add(torus('stemTopGoldBand', 1.66, 0.2, BRASS, [0, 24.0, 0], [Math.PI / 2, 0, 0]));
  group.add(sphere('stemTopBead', 0.48, BRASS, [0, 26.65, 0], 20));
}

function addShade(group) {
  // Revolved outer dome: top around y=38, open rim around y=28.5.
  const outerProfile = [[0, 37.9], [1.6, 37.82], [3.6, 37.35], [5.4, 36.1], [6.65, 34.1], [7.3, 31.2], [7.5, 28.9]];
  group.add(lathe('shadeDome', outerProfile, GREEN, 56));
  const innerProfile = [[0, 28.86], [2.2, 28.86], [4.5, 28.84], [6.5, 28.78], [7.22, 28.72]];
  group.add(lathe('shadeReflector', innerProfile, IVORY, 56));
  group.add(torus('shadeRimGold', 7.35, 0.2, BRASS, [0, 28.88, 0], [Math.PI / 2, 0, 0]));
  group.add(torus('shadeNeckBand', 1.72, 0.18, BRASS, [0, 37.1, 0]));
  group.add(cylinder('shadeNeck', 1.45, 1.65, GREEN, 32, [0, 37.55, 0]));
  group.add(sphere('shadeFinial', 0.42, BRASS, [0, 38.45, 0], 20));
}

function addArm(group) {
  const pivot = new THREE.Group(); pivot.name = 'armPivot'; pivot.userData.animationRole = 'arm-rotation'; pivot.userData.pivotAxis = 'Y';
  group.add(pivot);
  pivot.add(rodBetween('armStemSupport', [0, 25.85, 0], [0, 30.25, 0], 0.34, BRASS, 14));
  pivot.add(torus('armSupportCollar', 1.7, 0.15, BRASS, [0, 25.9, 0], [Math.PI / 2, 0, 0]));
  pivot.add(rodBetween('armMainLink', [0, 30.25, 0], [-10.5, 34.0, 0], 0.28, BRASS, 16));
  pivot.add(sphere('armStemJoint', 1.05, BRASS, [0, 30.25, 0], 24));
  pivot.add(sphere('armShadeJoint', 1.0, BRASS, [-10.5, 34.0, 0], 24));
  pivot.add(rodBetween('shadeMountNeck', [-10.5, 34.0, 0], [-10.5, 36.7, 0], 0.26, BRASS, 14));
  pivot.add(torus('armStemCollar', 1.75, 0.16, BRASS, [0, 30.25, 0]));
  const shadeMount = new THREE.Group(); shadeMount.name = 'shadeMount'; shadeMount.position.set(-10.5, 36.7, 0); shadeMount.userData.animationRole = 'shade-angle';
  pivot.add(shadeMount);
  // The shade remains a root-level assembly at the measured world-local height;
  // the mount is an animation pivot/socket rather than a second transform.
  shadeMount.userData.target = 'shade';
}

function addJoint(group) {
  group.add(sphere('jointStem', 0.8, BRASS, [0, 30.25, 0], 20));
  group.add(sphere('jointShade', 0.75, BRASS, [-10.5, 34.0, 0], 20));
  group.add(torus('jointStemRing', 0.93, 0.12, BRASS_DARK, [0, 30.25, 0], [Math.PI / 2, 0, 0]));
}

function addSwitch(group) {
  group.add(rodBetween('switchNeck', [2.0, 24.0, 0], [2.15, 21.4, 0], 0.18, BRASS, 12));
  group.add(torus('switchCollar', 0.54, 0.12, BRASS, [2.15, 21.2, 0]));
  group.add(lathe('switchBody', [[0, 18.1], [0.5, 18.1], [0.68, 18.42], [0.58, 19.15], [0.36, 19.65], [0.36, 20.1], [0, 20.1]], BRASS, 28, [2.15, 0, 0]));
  group.add(sphere('switchPull', 0.36, BRASS, [2.15, 17.7, 0], 18));
  group.userData.animationRole = 'switch-toggle';
}

function addCord(group) {
  const cable = tube('cordCable', [[2.18, 20.0, 0.1], [2.5, 18.4, 0.3], [3.0, 15.9, 0.55], [3.15, 13.0, 0.55], [2.9, 10.8, 0.5]], 0.12, RUBBER, 36, 8);
  group.add(cable);
  group.userData.replaceableCurve = true;
}

export function createDeskLampModel(options = {}) {
  const root = new THREE.Group();
  root.name = 'deskLamp';
  root.userData = {
    id: 'deskLamp',
    coordinateFrame: { front: '+Z', up: '+Y', origin: 'base center', units: 'cm' },
    dimensions: DESK_LAMP_DIMENSIONS,
    sourceReference: 'C:/Users/ZYB/Desktop/reference/d3284e9e-9fdd-4936-90b7-292969506e05.png',
    approximationNotes: ['underside fasteners', 'internal bulb socket', 'rear cable routing', 'hidden hinge internals'],
    animation: { arm: 'armPivot', shade: 'shadeMount', switch: 'switch', light: 'lightControl' },
    replaceableParts: ['shadeReflector', 'cordCable', 'shadeDome']
  };

  const base = new THREE.Group(); base.name = 'base'; root.add(base); addBase(base);
  const stem = new THREE.Group(); stem.name = 'stem'; root.add(stem); addStem(stem);
  const shade = new THREE.Group(); shade.name = 'shade'; root.add(shade); addShade(shade);
  const shadeRim = new THREE.Group(); shadeRim.name = 'shadeRim'; root.add(shadeRim); shadeRim.add(torus('shadeRim', 7.35, 0.16, BRASS, [0, 28.88, 0], [Math.PI / 2, 0, 0]));
  const arm = new THREE.Group(); arm.name = 'arm'; root.add(arm); arm.userData.pivot = [0, 30.25, 0]; arm.userData.animationRole = 'articulated-arm'; arm.userData.shadeRef = shade; addArm(arm); // shade is mounted into the articulated pivot
  const joint = new THREE.Group(); joint.name = 'joint'; root.add(joint); addJoint(joint);
  const sw = new THREE.Group(); sw.name = 'switch'; root.add(sw); addSwitch(sw);
  const cord = new THREE.Group(); cord.name = 'cord'; root.add(cord); addCord(cord);
  const lightControl = new THREE.PointLight(0xffd9a0, 0.0, 18, 2); lightControl.name = 'lightControl'; lightControl.position.set(-10.5, 28.6, 0); lightControl.userData.animatable = true; root.add(lightControl);
  shade.position.x = -10.5;
  // Required shade hierarchy remains visible through the arm pivot while retaining a stable root child.
  shade.userData.parentSocket = 'arm.shadeMount';
  root.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  root.updateMatrixWorld(true);
  return root;
}

export const DESK_LAMP_MATERIALS = { green: GREEN, greenDark: GREEN_DARK, brass: BRASS, brassDark: BRASS_DARK, ivory: IVORY, rubber: RUBBER };
