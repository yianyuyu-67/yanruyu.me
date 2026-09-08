import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CHAIR_DIMENSIONS = Object.freeze({ width: 5.2, depth: 6.25, height: 10.5, seatHeight: 4.8 });

const palette = {
  wood: 0x7a422f,
  woodLight: 0xa9653f,
  woodDark: 0x4f2f26,
  leather: 0x405744,
  leatherLight: 0x5e7657,
  leatherDark: 0x2c3d30,
  brass: 0xb8894b,
  clayWood: 0x997867,
  clayLeather: 0x718b79,
  clayMetal: 0xb6a787,
};

function physical(color, roughness, metalness = 0, extras = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness, ...extras });
}

export const CHAIR_MATERIALS = {
  wood: physical(palette.wood, 0.5, 0, { clearcoat: 0.08, clearcoatRoughness: 0.58 }),
  woodLight: physical(palette.woodLight, 0.48, 0, { clearcoat: 0.1, clearcoatRoughness: 0.55 }),
  woodDark: physical(palette.woodDark, 0.58),
  leather: physical(palette.leather, 0.42, 0, { clearcoat: 0.18, clearcoatRoughness: 0.48 }),
  leatherLight: physical(palette.leatherLight, 0.39, 0, { clearcoat: 0.2, clearcoatRoughness: 0.46 }),
  leatherDark: physical(palette.leatherDark, 0.55),
  brass: physical(palette.brass, 0.34, 0.68),
  clayWood: physical(palette.clayWood, 0.82),
  clayLeather: physical(palette.clayLeather, 0.78),
  clayMetal: physical(palette.clayMetal, 0.72),
};

function finish(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.partId = mesh.name;
  mesh.userData.explodeWithParent = true;
  return mesh;
}

function rounded(name, size, position, material, radius = 0.1, segments = 5) {
  const safeRadius = Math.min(radius, Math.min(...size) * 0.45);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, safeRadius), material);
  mesh.name = name;
  mesh.position.set(...position);
  return finish(mesh);
}

function ellipsoid(name, radius, scale, position, material, widthSegments = 20, heightSegments = 12) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material);
  mesh.name = name;
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  return finish(mesh);
}

function extrudedXY(name, shape, depth, position, material, bevel = 0.1, bevelSegments = 4) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 16,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel * 0.25,
    bevelSegments,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  return finish(mesh);
}

function tube(name, points, radius, material, tubularSegments = 28, radialSegments = 9, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, 'centripetal');
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed), material);
  mesh.name = name;
  return finish(mesh);
}

function taperedTube(name, points, material, radiusStart = 0.16, radiusEnd = 0.25, bulge = 0.035) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
  const segments = 34;
  const radialSegments = 10;
  const frames = curve.computeFrenetFrames(segments, false);
  const positions = [];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const center = curve.getPointAt(t);
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t) + Math.sin(t * Math.PI) * bulge;
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];
    for (let j = 0; j < radialSegments; j += 1) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const offset = normal.clone().multiplyScalar(Math.cos(angle) * radius).addScaledVector(binormal, Math.sin(angle) * radius);
      positions.push(center.x + offset.x, center.y + offset.y, center.z + offset.z);
    }
  }
  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const next = (j + 1) % radialSegments;
      const a = i * radialSegments + j;
      const b = (i + 1) * radialSegments + j;
      const c = (i + 1) * radialSegments + next;
      const d = i * radialSegments + next;
      indices.push(a, b, d, b, c, d);
    }
  }
  const start = curve.getPointAt(0);
  const end = curve.getPointAt(1);
  const startCenter = positions.length / 3;
  positions.push(start.x, start.y, start.z);
  const endCenter = positions.length / 3;
  positions.push(end.x, end.y, end.z);
  for (let j = 0; j < radialSegments; j += 1) {
    const next = (j + 1) % radialSegments;
    indices.push(startCenter, next, j);
    const endOffset = segments * radialSegments;
    indices.push(endCenter, endOffset + j, endOffset + next);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return finish(mesh);
}

function backCushionShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.55, -1.92);
  shape.bezierCurveTo(-1.78, -1.15, -1.76, 0.45, -1.48, 1.42);
  shape.bezierCurveTo(-1.18, 2.05, -0.62, 2.28, 0, 2.4);
  shape.bezierCurveTo(0.62, 2.28, 1.18, 2.05, 1.48, 1.42);
  shape.bezierCurveTo(1.76, 0.45, 1.78, -1.15, 1.55, -1.92);
  shape.bezierCurveTo(0.76, -2.18, -0.76, -2.18, -1.55, -1.92);
  return shape;
}

function addBlockout(root, material) {
  const blockout = new THREE.Group();
  blockout.name = 'blockout';
  root.add(blockout);
  blockout.add(rounded('blockoutSeat', [4.9, 0.9, 4.75], [0, 4.34, 0.18], material, 0.26, 4));
  blockout.add(extrudedXY('blockoutBack', backCushionShape(), .7, [0, 7.72, -2.48], material, .16, 5));
  blockout.add(tube('blockoutCrest', [[-2.05,9.72,-2.5],[-1.55,10.08,-2.5],[0,10.32,-2.5],[1.55,10.08,-2.5],[2.05,9.72,-2.5]], .21, material, 34, 9));
  const blockoutLegPaths = [
    [[-2.38,.03,2.95],[-2.3,.8,2.82],[-2.05,1.72,2.55],[-2.22,2.72,2.38],[-2.18,3.9,2.28]],
    [[2.38,.03,2.95],[2.3,.8,2.82],[2.05,1.72,2.55],[2.22,2.72,2.38],[2.18,3.9,2.28]],
    [[-2.18,.03,-3.0],[-2.12,1.25,-2.72],[-2.08,2.6,-2.4],[-2.15,3.9,-2.18]],
    [[2.18,.03,-3.0],[2.12,1.25,-2.72],[2.08,2.6,-2.4],[2.15,3.9,-2.18]],
  ];
  blockoutLegPaths.forEach((points, index) => {
    blockout.add(taperedTube(`blockoutLeg${index + 1}`, points, material, .14, .24, .025));
  });
  for (const x of [-2.05,2.05]) blockout.add(taperedTube(`blockoutBackPost-${x}`,[[x,3.8,-2.25],[x,6.8,-2.42],[x,9.95,-2.48]],material,.19,.22,0));
  blockout.add(rounded('blockoutBackRail',[4.25,.34,.42],[0,5.42,-2.4],material,.1,4));
  return root;
}

function addNailheads(group, materials) {
  const nailheads = new THREE.Group();
  nailheads.name = 'nailheadTrim';
  group.add(nailheads);
  const geometry = new THREE.SphereGeometry(0.055, 10, 7);
  const positions = [];
  for (let i = 0; i < 16; i += 1) positions.push([-2.22 + i * (4.44 / 15), 4.02, 2.585]);
  for (const side of [-1, 1]) for (let i = 1; i < 11; i += 1) positions.push([side * 2.42, 4.02, 2.35 - i * 0.43]);
  const instances = new THREE.InstancedMesh(geometry, materials.brass, positions.length);
  instances.name = 'nailheadInstances';
  const matrix = new THREE.Matrix4();
  positions.forEach((position, index) => {
    matrix.makeTranslation(...position);
    instances.setMatrixAt(index, matrix);
  });
  instances.instanceMatrix.needsUpdate = true;
  instances.userData.instanceLabels = positions.map((_, index) => `nailhead${index + 1}`);
  nailheads.add(finish(instances));
}

function addTufting(group, materials) {
  const puffs = new THREE.Group();
  puffs.name = 'upholsteryBulges';
  group.add(puffs);
  const puffPositions = [[-0.72,8.72],[0.72,8.72],[-1.03,7.7],[0,7.72],[1.03,7.7],[-0.58,6.66],[0.58,6.66]];
  puffPositions.forEach(([x,y],i) => puffs.add(ellipsoid(`leatherBulge${i + 1}`,1,[.82,.86,.1],[x,y,-1.77],materials.leather,24,16)));

  const seams = new THREE.Group();
  seams.name = 'tuftSeams';
  group.add(seams);
  const seamPaths = [
    [[-1.3,9.12,-1.63],[-.68,8.64,-1.62],[.94,6.45,-1.63]],
    [[1.3,9.12,-1.63],[.68,8.64,-1.62],[-.94,6.45,-1.63]],
    [[-.32,9.55,-1.63],[.68,8.64,-1.62],[1.18,7.6,-1.63]],
    [[.32,9.55,-1.63],[-.68,8.64,-1.62],[-1.18,7.6,-1.63]],
  ];
  seamPaths.forEach((points,i) => seams.add(tube(`tuftSeam${i + 1}`, points, 0.01, materials.leatherDark, 18, 6)));

  const buttons = new THREE.Group();
  buttons.name = 'tuftButtons';
  group.add(buttons);
  const buttonPositions = [[-0.68,8.66],[0.68,8.66],[-1.0,7.64],[1.0,7.64],[-0.54,6.64],[0.54,6.64]];
  const buttonGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 14);
  buttonPositions.forEach(([x,y],i) => {
    const button = new THREE.Mesh(buttonGeometry, materials.leatherDark);
    button.name = `tuftButton${i + 1}`;
    button.rotation.x = Math.PI / 2;
    button.position.set(x,y,-1.6);
    finish(button);
    buttons.add(button);
  });
}

function addCrest(backFrame, materials) {
  const crest = new THREE.Group();
  crest.name = 'crestOrnament';
  backFrame.add(crest);
  crest.add(tube('crestOuterArch', [[-2.05,9.72,-2.48],[-1.65,10.06,-2.48],[-0.78,10.32,-2.48],[0,10.18,-2.48],[0.78,10.32,-2.48],[1.65,10.06,-2.48],[2.05,9.72,-2.48]], 0.18, materials.woodLight, 42, 10));
  for (const side of [-1, 1]) {
    crest.add(ellipsoid(
      `crestPostJoint${side > 0 ? 'Left' : 'Right'}`,
      1,
      [0.25, 0.3, 0.22],
      [side * 2.035, 9.76, -2.49],
      materials.woodLight,
      18,
      12,
    ));
  }
  for (const side of [-1,1]) {
    crest.add(tube(`crestScroll${side > 0 ? 'Left' : 'Right'}`, [[side*.2,10.08,-2.28],[side*.65,10.38,-2.24],[side*1.12,10.18,-2.22],[side*.88,9.82,-2.2],[side*.52,9.96,-2.18]], 0.105, materials.woodLight, 28, 8));
    crest.add(ellipsoid(`crestLeaf${side > 0 ? 'Left' : 'Right'}`, 1, [0.25,0.12,0.09], [side*1.44,10.06,-2.2], materials.woodLight, 16, 9));
  }
  const rosette = new THREE.Group();
  rosette.name = 'crestRosette';
  crest.add(rosette);
  rosette.add(ellipsoid('crestRosetteCenter', 1, [0.18,0.18,0.11], [0,9.98,-2.12], materials.woodDark, 18, 10));
  for (let i=0;i<6;i+=1) {
    const a=(i/6)*Math.PI*2;
    const petal=ellipsoid(`crestPetal${i+1}`,1,[0.25,0.12,0.08],[Math.cos(a)*.28,9.98+Math.sin(a)*.28,-2.16],materials.woodLight,14,8);
    petal.rotation.z=a;
    rosette.add(petal);
  }
}

export function createChairModel(options = {}) {
  const pass = options.pass || 'lighting';
  const stage = { blockout:0, structure:1, form:2, material:3, lighting:4 }[pass] ?? 4;
  const root = new THREE.Group();
  root.name = 'chair';
  root.userData = {
    id:'chair',
    coordinateFrame:{front:'+Z',up:'+Y',origin:'four-foot ground-contact center'},
    dimensions:CHAIR_DIMENSIONS,
    sourceReference:'C:/Users/ZYB/Desktop/reference/yizi.jpg',
    approximationNotes:['underside joinery','rear upholstery seams','reverse carving relief'],
    sculptRuntime:{clickable:true,explodable:true,replaceableParts:['seatCushion','backCushion','tuftButtons','nailheadTrim']}
  };

  const materials = stage >= 3 ? CHAIR_MATERIALS : {
    wood:CHAIR_MATERIALS.clayWood, woodLight:CHAIR_MATERIALS.clayWood, woodDark:CHAIR_MATERIALS.clayWood,
    leather:CHAIR_MATERIALS.clayLeather, leatherLight:CHAIR_MATERIALS.clayLeather, leatherDark:CHAIR_MATERIALS.clayLeather,
    brass:CHAIR_MATERIALS.clayMetal,
  };
  if (stage === 0) return addBlockout(root, materials.wood);

  const frame = new THREE.Group(); frame.name = 'frameAssembly'; root.add(frame);
  const seatFrame = new THREE.Group(); seatFrame.name = 'seatFrame'; frame.add(seatFrame);
  const backFrame = new THREE.Group(); backFrame.name = 'backFrame'; frame.add(backFrame);
  const legSystem = new THREE.Group(); legSystem.name = 'legSystem'; frame.add(legSystem);
  const upholstery = new THREE.Group(); upholstery.name = 'upholstery'; root.add(upholstery);

  seatFrame.add(rounded('frontRail',[5.0,.58,.44],[0,3.77,2.36],materials.woodLight,.12,5));
  seatFrame.add(rounded('rearRail',[4.75,.55,.42],[0,3.78,-2.18],materials.wood,.1,5));
  const sideRails = new THREE.Group(); sideRails.name = 'sideRails'; seatFrame.add(sideRails);
  for (const x of [-2.38,2.38]) sideRails.add(rounded(`sideRail${x>0?'Left':'Right'}`,[.42,.56,4.55],[x,3.78,.08],materials.wood,.1,5));

  const frontLegPaths = [
    [[-2.38,.03,2.95],[-2.3,.8,2.82],[-2.05,1.72,2.55],[-2.22,2.72,2.38],[-2.18,3.82,2.28]],
    [[2.38,.03,2.95],[2.3,.8,2.82],[2.05,1.72,2.55],[2.22,2.72,2.38],[2.18,3.82,2.28]],
  ];
  const frontLegs = new THREE.Group(); frontLegs.name='frontLegs'; legSystem.add(frontLegs);
  frontLegPaths.forEach((points,i)=>frontLegs.add(taperedTube(i?'leftFrontLeg':'rightFrontLeg',points,materials.woodLight,.14,.25,.045)));
  const rearLegPaths = [
    [[-2.18,.03,-3.0],[-2.12,1.25,-2.72],[-2.08,2.6,-2.4],[-2.15,3.82,-2.18]],
    [[2.18,.03,-3.0],[2.12,1.25,-2.72],[2.08,2.6,-2.4],[2.15,3.82,-2.18]],
  ];
  const rearLegs = new THREE.Group(); rearLegs.name='rearLegs'; legSystem.add(rearLegs);
  rearLegPaths.forEach((points,i)=>rearLegs.add(taperedTube(i?'leftRearLeg':'rightRearLeg',points,materials.wood,.13,.22,.025)));
  const frontFeet = new THREE.Group(); frontFeet.name='frontFeet'; frontLegs.add(frontFeet);
  for (const x of [-2.38,2.38]) frontFeet.add(ellipsoid(`frontFootCarving${x>0?'Left':'Right'}`,1,[.22,.13,.24],[x,.16,2.91],materials.woodDark,16,9));

  const backPostPaths = [
    [[-2.15,3.7,-2.18],[-2.2,5.4,-2.35],[-2.28,7.2,-2.52],[-2.2,9.35,-2.55],[-2.02,9.8,-2.52]],
    [[2.15,3.7,-2.18],[2.2,5.4,-2.35],[2.28,7.2,-2.52],[2.2,9.35,-2.55],[2.02,9.8,-2.52]],
  ];
  backPostPaths.forEach((points,i)=>backFrame.add(taperedTube(i?'leftBackPost':'rightBackPost',points,materials.woodLight,.2,.22,.02)));
  backFrame.add(tube('lowerBackRail',[[-2.05,5.42,-2.42],[0,5.25,-2.38],[2.05,5.42,-2.42]],.18,materials.wood,26,9));

  const seatCushion = rounded('seatCushion',[4.82,.86,4.62],[0,4.37,.22],materials.leather,.31,7);
  seatCushion.userData.replaceable = true;
  upholstery.add(seatCushion);
  const backCushion = extrudedXY('backCushion',backCushionShape(),.58,[0,7.72,-2.18],materials.leather,.14,6);
  backCushion.userData.replaceable = true;
  upholstery.add(backCushion);

  if (stage >= 1) {
    const seatPiping = new THREE.Group(); seatPiping.name='seatPiping'; upholstery.add(seatPiping);
    seatPiping.add(tube('seatPipingLoop',[[-2.34,4.02,2.42],[-1.2,4.0,2.53],[1.2,4.0,2.53],[2.34,4.02,2.42],[2.42,4.02,.1],[2.34,4.02,-2.12],[0,4.0,-2.2],[-2.34,4.02,-2.12],[-2.42,4.02,.1]],.06,materials.leatherDark,54,7,true));
    addNailheads(seatFrame, materials);
    addTufting(upholstery, materials);
    addCrest(backFrame, materials);
    const openwork = new THREE.Group(); openwork.name='sideOpenwork'; backFrame.add(openwork);
    for (const side of [-1,1]) {
      openwork.add(tube(`sideScroll${side>0?'Left':'Right'}`,[[side*1.86,5.7,-2.32],[side*2.02,6.65,-2.25],[side*1.92,7.8,-2.2],[side*2.08,8.9,-2.28],[side*1.78,9.52,-2.34]],.105,materials.woodLight,34,8));
      openwork.add(tube(`sideInnerCurl${side>0?'Left':'Right'}`,[[side*1.82,8.9,-2.14],[side*1.55,9.18,-2.08],[side*1.62,9.48,-2.1]],.07,materials.woodLight,18,7));
    }
  }

  root.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.userData.explodeWithParent = true;
    }
  });
  return root;
}
