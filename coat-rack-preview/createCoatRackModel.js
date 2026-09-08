import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEFAULTS = Object.freeze({
  height: 15.3,
  width: 5.2,
  depth: 3.0,
  woodColor: 0x75442c,
  goldColor: 0xb5812f,
  coatColor: 0xc7a780,
  hatColor: 0x4d3428,
  includeCoat: true,
  includeHat: true
});

function mat(color, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function rounded(size, radius = 0.12) {
  return new RoundedBoxGeometry(size[0], size[1], size[2], 5, Math.min(radius, Math.min(...size) * 0.42));
}

function mesh(parent, name, geometry, material, position = [0, 0, 0], userData = {}) {
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  object.userData = { partId: name, ...userData };
  parent.add(object);
  return object;
}

function cylinderBetween(parent, name, a, b, radius, material, userData = {}) {
  const start = new THREE.Vector3(...a); const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start); const length = delta.length();
  const object = mesh(parent, name, new THREE.CylinderGeometry(radius, radius * 1.08, length, 12), material, start.clone().add(end).multiplyScalar(0.5).toArray(), userData);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return object;
}

function addHook(parent, name, x, y, z, side, gold) {
  const group = new THREE.Group(); group.name = name; group.position.set(x, y, z); group.userData = { partId: 'hooks', interactionId: `coat-rack-hook-${name}` }; parent.add(group);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.16, 0),
    new THREE.Vector3(side * 0.05, -0.08, 0),
    new THREE.Vector3(side * 0.30, -0.16, 0),
    new THREE.Vector3(side * 0.46, 0.05, side * 0.02),
    new THREE.Vector3(side * 0.40, 0.27, side * 0.06)
  ]);
  mesh(group, 'hookStem', new THREE.TubeGeometry(curve, 14, 0.075, 10, false), gold, [0, 0, 0], { partId: 'hooks' });
  mesh(group, 'hookBall', new THREE.SphereGeometry(0.13, 16, 12), gold, [side * 0.40, 0.28, side * 0.06], { partId: 'hooks' });
  return group;
}

function addCoat(parent, coatMat, darkMat) {
  const coat = new THREE.Group(); coat.name = 'coat'; coat.userData = { interactionId: 'coat-rack-coat', partId: 'coat' }; parent.add(coat);
  // A tapered, extruded silhouette gives the garment the recognizable long-coat profile.
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.18, 0.08); bodyShape.lineTo(1.78, 0.08); bodyShape.quadraticCurveTo(1.64, 0.55, 1.60, 1.25);
  bodyShape.lineTo(1.47, 3.55); bodyShape.quadraticCurveTo(1.40, 4.25, 1.14, 4.72);
  bodyShape.lineTo(0.92, 5.04); bodyShape.lineTo(0.36, 5.04); bodyShape.lineTo(0.12, 4.70);
  bodyShape.quadraticCurveTo(-0.05, 4.18, -0.10, 3.50); bodyShape.lineTo(-0.22, 1.16);
  bodyShape.quadraticCurveTo(-0.20, 0.48, -0.18, 0.08);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: 0.46, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08, bevelThickness: 0.06 });
  bodyGeo.translate(0, 0, -0.23);
  mesh(coat, 'coatBody', bodyGeo, coatMat, [0.08, 3.05, -0.03], { partId: 'coat' });

  const detailShape = (points, name, material, pos, depth = 0.08) => {
    const shape = new THREE.Shape(); shape.moveTo(points[0][0], points[0][1]);
    for (const p of points.slice(1)) shape.lineTo(p[0], p[1]); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.025, bevelThickness: 0.02 });
    geo.translate(0, 0, -depth * 0.5);
    return mesh(coat, name, geo, material, pos, { partId: 'coat' });
  };
  // Split lapels, collar and front placket sit proud of the front surface.
  detailShape([[0.40, 4.96], [0.70, 4.96], [0.58, 4.32], [0.32, 4.55]], 'coatLeftLap', darkMat, [0.08, 3.05, 0.25]);
  detailShape([[0.70, 4.96], [0.91, 4.72], [0.82, 4.28], [0.58, 4.32]], 'coatRightLap', darkMat, [0.08, 3.05, 0.25]);
  mesh(coat, 'coatCollar', rounded([0.84, 0.22, 0.16], 0.06), darkMat, [0.58, 7.94, 0.28], { partId: 'coat' });
  mesh(coat, 'coatPlacket', rounded([0.12, 3.45, 0.13], 0.04), darkMat, [0.68, 5.34, 0.28], { partId: 'coat' });
  mesh(coat, 'coatBelt', rounded([1.52, 0.14, 0.16], 0.05), darkMat, [0.82, 5.08, 0.26], { partId: 'coat' });
  for (const y of [4.45, 5.10, 5.75, 6.40, 7.05]) mesh(coat, `coatButton-${y}`, new THREE.SphereGeometry(0.085, 14, 10), darkMat, [0.68, y, 0.36], { partId: 'coat' });

  const sleeve = new THREE.Group(); sleeve.name = 'coatSleeves'; sleeve.userData.partId = 'coat'; coat.add(sleeve);
  const rightSleeve = mesh(sleeve, 'coatSleeveRight', rounded([0.50, 2.25, 0.52], 0.16), coatMat, [1.67, 6.62, 0.02], { partId: 'coat' });
  // Sleeves fall away from the shoulders; positive Z rotation makes the right cuff drop outward.
  rightSleeve.rotation.z = 0.26;
  const leftSleeve = mesh(sleeve, 'coatSleeveLeft', rounded([0.44, 1.95, 0.48], 0.15), coatMat, [-0.10, 6.48, 0.03], { partId: 'coat' });
  leftSleeve.rotation.z = -0.22;
  const cuff = mesh(sleeve, 'coatCuff', rounded([0.63, 0.32, 0.58], 0.10), coatMat, [1.88, 5.57, 0.03], { partId: 'coat' }); cuff.rotation.z = 0.26;
  const cuffBand = mesh(sleeve, 'coatCuffBand', rounded([0.66, 0.10, 0.60], 0.04), darkMat, [1.91, 5.70, 0.03], { partId: 'coat' }); cuffBand.rotation.z = 0.26;
  mesh(coat, 'coatPocket', rounded([0.52, 0.10, 0.16], 0.04), darkMat, [1.15, 4.65, 0.27], { partId: 'coat' });
  mesh(coat, 'coatHem', rounded([1.95, 0.22, 0.50], 0.08), coatMat, [0.84, 3.12, 0.01], { partId: 'coat' });
  // Hang the garment beside the post, with its shoulder aligned to the nearby hook.
  // Scale from the hem upward so the enlarged coat still reaches the lower hook area.
  coat.scale.setScalar(1.42);
  coat.position.set(0.52, -0.85, -0.34);
  return coat;
}

function addHat(parent, hatMat, gold) {
  const hat = new THREE.Group(); hat.name = 'hat'; hat.userData = { interactionId: 'coat-rack-hat', partId: 'hat' }; parent.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.18, 32), hatMat); brim.name = 'hatBrim'; brim.rotation.z = Math.PI / 2; brim.position.set(-0.55, 10.35, 0.12); brim.castShadow = true; brim.receiveShadow = true; brim.userData = { partId: 'hat' }; hat.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.70, 0.78, 0.74, 24), hatMat); crown.name = 'hatCrown'; crown.rotation.z = Math.PI / 2; crown.position.set(-0.56, 10.35, 0.18); crown.castShadow = true; crown.receiveShadow = true; crown.userData = { partId: 'hat' }; hat.add(crown);
  mesh(hat, 'hatBand', rounded([0.12, 0.16, 1.28], 0.04), gold, [-0.56, 10.35, 0.26], { partId: 'hat' });
  return hat;
}

export function createCoatRackModel(options = {}) {
  const c = { ...DEFAULTS, ...options };
  const wood = mat(c.woodColor, 0.76, 0);
  const woodLight = mat(0x925b38, 0.72, 0);
  const gold = mat(c.goldColor, 0.34, 0.72);
  const coatMat = mat(c.coatColor, 0.9, 0);
  const coatDark = mat(0x74583f, 0.88, 0);
  const hatMat = mat(c.hatColor, 0.78, 0);
  const root = new THREE.Group(); root.name = 'coatRack';
  root.userData = { id: 'coatRack', dimensions: { height: c.height, width: c.width, depth: c.depth }, interactionId: 'coat-rack', coordinateFrame: { up: '+Y', front: '+Z' } };

  const verticalPost = new THREE.Group(); verticalPost.name = 'verticalPost'; verticalPost.userData = { partId: 'verticalPost', interactionId: 'coat-rack-post' }; root.add(verticalPost);
  mesh(verticalPost, 'postShaft', rounded([0.72, 12.7, 0.62], 0.16), wood, [0, 7.55, 0], { partId: 'verticalPost' });
  mesh(verticalPost, 'postFrontInlay', rounded([0.18, 10.3, 0.07], 0.04), woodLight, [0, 7.65, -0.34], { partId: 'verticalPost' });

  const topCap = new THREE.Group(); topCap.name = 'topCap'; topCap.userData = { partId: 'topCap', interactionId: 'coat-rack-top-cap' }; root.add(topCap);
  mesh(topCap, 'capBlock', rounded([1.12, 0.62, 0.92], 0.16), wood, [0, 14.10, 0], { partId: 'topCap' });
  mesh(topCap, 'capCrown', new THREE.SphereGeometry(0.34, 20, 14), woodLight, [0, 14.60, 0], { partId: 'topCap' });

  const hooks = new THREE.Group(); hooks.name = 'hooks'; hooks.userData = { partId: 'hooks', interactionId: 'coat-rack-hooks' }; root.add(hooks);
  [[-0.48, 12.95, 0.18, -1], [0.48, 12.95, 0.18, 1], [-0.48, 9.35, 0.18, -1], [0.48, 8.55, 0.18, 1], [-0.48, 4.05, 0.18, -1], [0.48, 3.55, 0.18, 1]].forEach(([x, y, z, side], index) => addHook(hooks, `hook-${index + 1}`, x, y, z, side, gold));

  const hatSupports = new THREE.Group(); hatSupports.name = 'hatSupports'; hatSupports.userData = { partId: 'hatSupports', interactionId: 'coat-rack-hat-supports' }; root.add(hatSupports);
  cylinderBetween(hatSupports, 'hatSupportArm', [0, 10.35, 0], [-1.0, 10.35, 0.16], 0.12, gold, { partId: 'hatSupports' });
  mesh(hatSupports, 'hatSupportDisc', new THREE.CylinderGeometry(0.34, 0.34, 0.16, 20), gold, [-1.0, 10.35, 0.16], { partId: 'hatSupports' });

  if (c.includeHat) addHat(root, hatMat, gold);
  if (c.includeCoat) addCoat(root, coatMat, coatDark);

  const base = new THREE.Group(); base.name = 'tripodBase'; base.userData = { partId: 'tripodBase', interactionId: 'coat-rack-base' }; root.add(base);
  mesh(base, 'baseCollar', rounded([0.92, 0.72, 0.86], 0.16), wood, [0, 1.12, 0], { partId: 'tripodBase' });
  const footY = 0.20;
  cylinderBetween(base, 'footFront', [0, 0.95, 0], [0, footY, 1.42], 0.28, wood, { partId: 'tripodBase' });
  cylinderBetween(base, 'footLeft', [0, 0.95, 0], [-1.36, footY, -0.62], 0.28, wood, { partId: 'tripodBase' });
  cylinderBetween(base, 'footRight', [0, 0.95, 0], [1.36, footY, -0.62], 0.28, wood, { partId: 'tripodBase' });
  for (const [name, pos] of [['footFrontTip', [0, footY, 1.42]], ['footLeftTip', [-1.36, footY, -0.62]], ['footRightTip', [1.36, footY, -0.62]]]) mesh(base, name, new THREE.SphereGeometry(0.30, 16, 12), woodLight, pos, { partId: 'tripodBase' });
  mesh(base, 'baseCenterBolt', new THREE.SphereGeometry(0.18, 16, 12), gold, [0, 0.74, 0.02], { partId: 'tripodBase' });

  root.traverse(object => { object.userData.modelId = 'coatRack'; if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  root.userData.interactionObjects = ['verticalPost', 'hooks', 'hat', 'coat', 'tripodBase'];
  return root;
}

export { DEFAULTS as COAT_RACK_DEFAULTS };
