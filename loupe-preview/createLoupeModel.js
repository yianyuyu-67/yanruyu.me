import * as THREE from 'three';

export const LOUPE_DIMENSIONS = Object.freeze({
  lensDiameter: 1.08,
  overallLength: 1.94,
  overallDepth: 1.32,
  thickness: 0.18,
  units: 'scene'
});

const BRASS = new THREE.MeshPhysicalMaterial({ color:0xb9823f, metalness:.72, roughness:.32, clearcoat:.08, clearcoatRoughness:.3 });
const BRASS_DARK = new THREE.MeshStandardMaterial({ color:0x6f4729, metalness:.62, roughness:.44 });
const WOOD = new THREE.MeshStandardMaterial({ color:0x704329, roughness:.78, metalness:0 });
const WOOD_DARK = new THREE.MeshStandardMaterial({ color:0x3f251c, roughness:.86, metalness:0 });
const GLASS = new THREE.MeshPhysicalMaterial({ color:0xdceaf0, transmission:.35, transparent:true, opacity:.48, roughness:.16, metalness:0, ior:1.45, thickness:.045, side:THREE.DoubleSide });
const GLASS_EDGE = new THREE.MeshPhysicalMaterial({ color:0xa7c1c7, transmission:.18, transparent:true, opacity:.34, roughness:.2, metalness:0, side:THREE.DoubleSide });

function finish(mesh, id, userData={}) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { componentId:id, ...userData };
  return mesh;
}
function cylinder(id, radius, height, material, segments=24, position=[0,0,0], quaternion=null, userData={}) {
  const mesh = finish(new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments), material), id, userData);
  mesh.position.set(...position);
  if (quaternion) mesh.quaternion.copy(quaternion);
  return mesh;
}
function torus(id, major, minor, material, position=[0,0,0], quaternion=null, userData={}) {
  const mesh = finish(new THREE.Mesh(new THREE.TorusGeometry(major,minor,10,36), material), id, userData);
  mesh.position.set(...position);
  if (quaternion) mesh.quaternion.copy(quaternion);
  return mesh;
}
function rodBetween(id, start, end, radius, material, segments=16, userData={}) {
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
  const delta = b.clone().sub(a), length = delta.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), delta.normalize());
  return cylinder(id,radius,length,material,segments,a.clone().add(b).multiplyScalar(.5).toArray(),quaternion,userData);
}
function axisQuaternion(direction) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(...direction).normalize());
}
function ringQuaternion(direction) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(...direction).normalize());
}

function addLensAssembly(group) {
  const lens = new THREE.Group(); lens.name='lensAssembly'; group.add(lens);
  lens.userData = { animationRole:'lens-tilt', pivotAxis:'Y', replaceable:true };
  const tabletopRing = ringQuaternion([0,1,0]);
  lens.add(cylinder('lensGlass',.53,.055,GLASS,40,[0,.095,0],null,{replaceableTexture:true, materialRole:'glass'}));
  lens.add(cylinder('lensInnerTint',.485,.018,GLASS_EDGE,36,[0,.132,0],null,{replaceableTexture:true}));
  lens.add(torus('brassOuterBezel',.565,.075,BRASS,[0,.13,0],tabletopRing,{materialRole:'satin-brass'}));
  lens.add(torus('brassInnerBezel',.505,.028,BRASS_DARK,[0,.16,0],tabletopRing,{materialRole:'dark-brass-recess'}));
  lens.add(torus('brassBackBand',.545,.04,BRASS_DARK,[0,.055,0],tabletopRing,{materialRole:'bezel-underband'}));
}

function addHandle(group) {
  const handle = new THREE.Group(); handle.name='handle'; group.add(handle);
  // The reference loupe has a compact grip relative to its large lens. Keep
  // the connector and lens at full size while reducing the complete handle
  // assembly around the lens-center pivot.
  handle.scale.setScalar(0.82);
  handle.userData = { animationRole:'static-part', replaceableTexture:true, scaleMultiplier:0.82 };
  const dir = new THREE.Vector3(-.82,0,.57).normalize();
  const start = dir.clone().multiplyScalar(.48).add(new THREE.Vector3(0,.09,0));
  const end = dir.clone().multiplyScalar(1.96).add(new THREE.Vector3(0,.09,0));
  const q = ringQuaternion(dir.toArray());
  handle.add(rodBetween('woodGrip',start.toArray(),end.toArray(),.22,WOOD,22,{materialRole:'wood-handle'}));
  handle.add(rodBetween('woodGripCore',start.clone().addScaledVector(dir,.03).toArray(),end.clone().addScaledVector(dir,-.03).toArray(),.17,WOOD_DARK,20,{materialRole:'dark-groove-core'}));
  for (let i=0;i<9;i++) {
    const t = .08 + i*.105;
    const p = start.clone().lerp(end,t);
    handle.add(torus(`gripRidge${i+1}`,.225,.018,BRASS_DARK,p.toArray(),q,{explodeWithParent:true,materialRole:'longitudinal-grip-ridge'}));
  }
  const collarPoint = start.clone().addScaledVector(dir,-.05);
  handle.add(torus('handleBrassCollar',.255,.055,BRASS,collarPoint.toArray(),q,{materialRole:'brass-collar'}));
  const pommelPoint = end.clone().addScaledVector(dir,.08);
  handle.add(rodBetween('pommelCap',end.clone().addScaledVector(dir,-.04).toArray(),pommelPoint.clone().addScaledVector(dir,.18).toArray(),.27,WOOD_DARK,20,{materialRole:'pommel'}));
  handle.add(torus('pommelBrassBand',.27,.04,BRASS_DARK,pommelPoint.toArray(),q,{materialRole:'pommel-band'}));
}

function addConnector(group) {
  const connector = new THREE.Group(); connector.name='connector'; group.add(connector);
  connector.userData = { animationRole:'static-part', parentSocket:'lensAssembly' };
  const dir = new THREE.Vector3(-.82,0,.57).normalize();
  const a = dir.clone().multiplyScalar(.43).add(new THREE.Vector3(0,.08,0));
  const b = dir.clone().multiplyScalar(.65).add(new THREE.Vector3(0,.08,0));
  const q = ringQuaternion(dir.toArray());
  connector.add(rodBetween('connectorNeck',a.toArray(),b.toArray(),.14,BRASS,16,{materialRole:'brass-connector'}));
  connector.add(torus('connectorLowerRing',.16,.035,BRASS_DARK,a.toArray(),q,{materialRole:'connector-ring'}));
  connector.add(torus('connectorUpperRing',.16,.035,BRASS,b.toArray(),q,{materialRole:'connector-ring'}));
}

export function createLoupeModel() {
  const root = new THREE.Group();
  root.name = 'loupe';
  root.userData = {
    id:'loupe',
    interactive:'newspaper',
    label:'放大镜：查看报纸上的话剧项目',
    coordinateFrame:{front:'+Z',up:'+Y',origin:'lens center',surface:'tabletop-horizontal'},
    dimensions:LOUPE_DIMENSIONS,
    replaceable:true,
    replaceableParts:['lensGlass','woodGrip','brassOuterBezel'],
    animation:{group:'deskSurfaceGroup',interaction:'newspaper',lensTilt:'lensAssembly'},
    approximationNotes:['hidden lens underside','rear bezel fasteners','exact optical curvature']
  };
  addLensAssembly(root);
  addConnector(root);
  addHandle(root);
  const collider = new THREE.Mesh(new THREE.BoxGeometry(2.5,.24,1.8), new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  collider.name='loupeCollider'; collider.position.set(-.55,.09,.45); collider.userData={id:'loupeCollider',interactive:'newspaper',isCollider:true}; collider.visible=false; root.add(collider);
  root.updateMatrixWorld(true);
  return root;
}

export const LOUPE_MATERIALS = { brass:BRASS, brassDark:BRASS_DARK, wood:WOOD, woodDark:WOOD_DARK, glass:GLASS, glassEdge:GLASS_EDGE };
