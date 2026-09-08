import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CARTON_DIMENSIONS = Object.freeze({ width: 2.65, depth: 1.95, height: 2.25, units: 'scene' });

const cardboard = new THREE.MeshStandardMaterial({ color: 0xb88f6c, roughness: 0.88, metalness: 0 });
const cardboardEdge = new THREE.MeshStandardMaterial({ color: 0x8f654b, roughness: 0.9, metalness: 0 });
const paper = new THREE.MeshStandardMaterial({ color: 0xe8d6ad, roughness: 0.94, metalness: 0 });
const greenInk = new THREE.MeshStandardMaterial({ color: 0x1d714f, roughness: 0.82, metalness: 0 });
const labelMat = new THREE.MeshStandardMaterial({ color: 0x171611, roughness: 0.84, metalness: 0 });

function finish(mesh, id, userData = {}) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { componentId: id, ...userData };
  return mesh;
}

function box(parent, id, size, position, material, rotation = [0, 0, 0], userData = {}) {
  const mesh = finish(new THREE.Mesh(new RoundedBoxGeometry(...size, 3, Math.min(0.08, Math.min(...size) / 6)), material), id, userData);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function makeLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#161510'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e5d2a8'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.fillStyle = '#ead9b1'; ctx.font = 'bold 42px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('BANKERS BOX', canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createCartonModel() {
  const root = new THREE.Group();
  root.name = 'carton';
  root.userData = {
    id: 'carton',
    coordinateFrame: { front: '+Z', up: '+Y', origin: 'body floor center', bottomY: 0 },
    dimensions: CARTON_DIMENSIONS,
    nonInteractive: true,
    replaceableTexture: 'carton-label-canvas',
    sculptRuntime: {
      nodes: ['cartonBody', 'cartonRim', 'cartonLid', 'cartonFrontFlap', 'cartonFileStack', 'cartonGreenStripeBand', 'cartonLabel', 'cartonCollider'],
      destructionGroups: { 'cardboard-shell': ['cartonBody', 'cartonRim', 'cartonLid', 'cartonFrontFlap'] },
      colliders: ['cartonCollider'],
      animationAnchors: { lidHinge: 'cartonLid', frontFlap: 'cartonFrontFlap' }
    },
    approximationNotes: ['corrugation is represented by low-contrast material variation', 'rear hinge and underside are inferred from one view']
  };

  const body = box(root, 'cartonBody', [2.65, 2.25, 1.95], [0, 1.125, 0], cardboard, [0, 0, 0], { materialRole: 'kraft-cardboard' });
  body.userData.localFeatures = ['cardboard-bevel', 'front-panel'];
  const rim = new THREE.Group(); rim.name = 'cartonRim'; rim.userData = { componentId: 'cartonRim', explodeWithParent: true }; root.add(rim);
  box(rim, 'cartonRimFront', [2.7, 0.14, 0.12], [0, 2.1, 0.96], cardboardEdge);
  box(rim, 'cartonRimBack', [2.7, 0.14, 0.12], [0, 2.1, -0.96], cardboardEdge);
  box(rim, 'cartonRimLeft', [0.12, 0.14, 1.9], [-1.29, 2.1, 0], cardboardEdge);
  box(rim, 'cartonRimRight', [0.12, 0.14, 1.9], [1.29, 2.1, 0], cardboardEdge);

  const lid = new THREE.Group(); lid.name = 'cartonLid'; lid.userData = { componentId: 'cartonLid', animationRole: 'hinge', pivotAxis: 'X', hingeSocket: [0, 2.12, -0.93] }; root.add(lid);
  lid.position.set(0, 2.12, -0.93);
  lid.rotation.x = 0.54;
  box(lid, 'cartonLidPanel', [2.78, 0.12, 1.9], [0, 0, -0.95], cardboard, [0, 0, 0], { explodeWithParent: true });
  box(lid, 'cartonLidInner', [2.48, 0.035, 1.62], [0, -0.07, -0.95], cardboardEdge, [0, 0, 0], { explodeWithParent: true });

  const flap = new THREE.Group(); flap.name = 'cartonFrontFlap'; flap.userData = { componentId: 'cartonFrontFlap', animationRole: 'hinge', pivotAxis: 'X', hingeSocket: [0, 2.03, 0.96] }; root.add(flap);
  flap.position.set(0, 2.03, 0.96);
  flap.rotation.x = -0.26;
  box(flap, 'cartonFrontFlapPanel', [2.7, 1.05, 0.1], [0, 0.48, 0.08], cardboard, [0, 0, 0], { explodeWithParent: true });

  const files = new THREE.Group(); files.name = 'cartonFileStack'; files.userData = { componentId: 'cartonFileStack', animationRole: 'static-part' }; root.add(files);
  for (let i = 0; i < 8; i += 1) {
    const file = box(files, `cartonFile${i + 1}`, [0.2, 0.12, 1.48], [-0.92 + i * 0.25, 2.12 + (i % 2) * 0.025, -0.06], paper, [0, (i % 2 ? 0.018 : -0.018), 0], { explodeWithParent: true, materialRole: 'file-paper' });
    file.userData.tabIndex = i;
  }

  const stripeBand = new THREE.Group(); stripeBand.name = 'cartonGreenStripeBand'; stripeBand.userData = { componentId: 'cartonGreenStripeBand', explodeWithParent: true }; root.add(stripeBand);
  for (let i = 0; i < 4; i += 1) box(stripeBand, `cartonGreenStripe${i + 1}`, [2.5, 0.045, 0.018], [0, 0.26 + i * 0.13, 0.986], greenInk, [0, 0, 0]);

  const label = finish(new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.38), new THREE.MeshStandardMaterial({ map: makeLabelTexture(), roughness: 0.82, metalness: 0 })), 'cartonLabel', { componentId: 'cartonLabel', replaceableTexture: 'assets/cartons/bankers-box-label.png', materialRole: 'printed-label' });
  label.position.set(0, 0.88, 0.997); label.castShadow = false; root.add(label);
  box(root, 'cartonHandleSlot', [0.8, 0.22, 0.025], [0, 1.58, 0.997], paper);
  box(root, 'cartonSideGreenMark', [0.48, 0.06, 0.02], [1.34, 0.72, 0.35], greenInk, [0, Math.PI / 2, 0]);

  const collider = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.45, 2.0), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  collider.name = 'cartonCollider'; collider.position.set(0, 1.2, 0); collider.visible = false; collider.userData = { componentId: 'cartonCollider', isCollider: true, nonInteractive: true }; root.add(collider);
  root.traverse(object => { object.userData.nonInteractive = true; if (object.isMesh) object.raycast = () => null; });
  root.updateMatrixWorld(true);
  return root;
}
