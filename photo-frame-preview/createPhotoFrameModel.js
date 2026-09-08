import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PHOTO_FRAME_DIMENSIONS = Object.freeze({ width: 3.6, height: 2.7, depth: 0.22, units: 'scene' });
export const DEFAULT_PHOTO_TEXTURE = new URL('./photo.jpg', import.meta.url).href;

const wood = new THREE.MeshStandardMaterial({ color: 0xb27632, roughness: 0.48, metalness: 0.08 });
const woodDark = new THREE.MeshStandardMaterial({ color: 0x75451f, roughness: 0.58, metalness: 0.05 });
const backing = new THREE.MeshStandardMaterial({ color: 0xefe2cd, roughness: 0.9, metalness: 0 });

function finish(mesh, id, userData = {}) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { componentId: id, ...userData };
  return mesh;
}

function roundedBox(parent, id, size, position, material, radius = 0.06) {
  const mesh = finish(new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(radius, Math.min(...size) / 5)), material), id);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function makeFallbackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 290;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d9c29c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#b38b66'; ctx.fillRect(28, 28, 456, 234);
  ctx.fillStyle = '#edd9b9'; ctx.fillRect(48, 48, 416, 194);
  ctx.fillStyle = '#7e5e48'; ctx.font = 'bold 28px Georgia'; ctx.textAlign = 'center'; ctx.fillText('PHOTO', 256, 160);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function configurePhotoTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function createPhotoFrameModel(options = {}) {
  const root = new THREE.Group();
  root.name = 'photoFrame';
  const photoPath = options.photoPath || DEFAULT_PHOTO_TEXTURE;
  const resolvedPhotoPath = new URL(photoPath, import.meta.url).href;
  root.userData = {
    id: 'photoFrame',
    coordinateFrame: { front: '+Z', up: '+Y', origin: 'frame center', bottomY: -PHOTO_FRAME_DIMENSIONS.height / 2 },
    dimensions: PHOTO_FRAME_DIMENSIONS,
    nonInteractive: true,
    replaceableTexture: photoPath,
    photoTextureFit: 'contain',
    photoTextureOrientation: 'horizontal',
    sculptRuntime: {
      nodes: ['photoFrameOuter', 'photoFrameInner', 'photoFrameBacking', 'photoFramePhoto', 'photoFramePhotoRear', 'photoFrameCollider'],
      destructionGroups: { frameShell: ['photoFrameOuter', 'photoFrameInner'] },
      colliders: ['photoFrameCollider'],
      animationAnchors: { photo: 'photoFramePhoto' }
    },
    approximationNotes: ['rear hanging hardware and exact wood grain are approximated from a single front reference']
  };

  const outer = new THREE.Group(); outer.name = 'photoFrameOuter'; outer.userData = { componentId: 'photoFrameOuter' }; root.add(outer);
  roundedBox(outer, 'photoFrameTop', [3.6, 0.38, 0.22], [0, 1.16, 0], wood, 0.07);
  roundedBox(outer, 'photoFrameBottom', [3.6, 0.38, 0.22], [0, -1.16, 0], wood, 0.07);
  roundedBox(outer, 'photoFrameLeft', [0.38, 2.0, 0.22], [-1.61, 0, 0], wood, 0.07);
  roundedBox(outer, 'photoFrameRight', [0.38, 2.0, 0.22], [1.61, 0, 0], wood, 0.07);
  const inner = new THREE.Group(); inner.name = 'photoFrameInner'; inner.userData = { componentId: 'photoFrameInner' }; root.add(inner);
  roundedBox(inner, 'photoFrameInnerTop', [3.05, 0.13, 0.25], [0, 0.92, 0.01], woodDark, 0.025);
  roundedBox(inner, 'photoFrameInnerBottom', [3.05, 0.13, 0.25], [0, -0.92, 0.01], woodDark, 0.025);
  roundedBox(inner, 'photoFrameInnerLeft', [0.13, 1.75, 0.25], [-1.47, 0, 0.01], woodDark, 0.025);
  roundedBox(inner, 'photoFrameInnerRight', [0.13, 1.75, 0.25], [1.47, 0, 0.01], woodDark, 0.025);
  const backingMesh = roundedBox(root, 'photoFrameBacking', [2.92, 1.7, 0.08], [0, 0, -0.06], backing, 0.015);
  backingMesh.castShadow = false;

  const photoMaterial = new THREE.MeshStandardMaterial({ map: makeFallbackTexture(), roughness: 0.72, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  // The source photo is 5900:3250. Contain it within the opening without distortion.
  const photo = finish(new THREE.Mesh(new THREE.PlaneGeometry(2.78, 1.533), photoMaterial), 'photoFramePhoto', {
    componentId: 'photoFramePhoto',
    replaceableTexture: photoPath,
    textureFit: 'contain',
    sourceAspect: 5900 / 3250,
    materialRole: 'replaceable-photograph'
  });
  photo.position.set(0, 0, 0.14);
  photo.castShadow = false;
  photo.renderOrder = 5;
  root.add(photo);
  // Mirror the replaceable photograph on the rear-facing side as well. This
  // keeps the frame readable during a right-wall orbit while preserving the
  // modeled backing and frame thickness between the two image planes.
  const photoRear = finish(new THREE.Mesh(new THREE.PlaneGeometry(2.78, 1.533), photoMaterial), 'photoFramePhotoRear', {
    componentId: 'photoFramePhotoRear',
    replaceableTexture: photoPath,
    textureFit: 'contain',
    sourceAspect: 5900 / 3250,
    materialRole: 'replaceable-photograph-rear'
  });
  photoRear.position.set(0, 0, -0.14);
  photoRear.rotation.y = Math.PI;
  photoRear.castShadow = false;
  photoRear.renderOrder = 5;
  root.add(photoRear);
  if (photoPath) {
    new THREE.TextureLoader().load(resolvedPhotoPath, texture => {
      configurePhotoTexture(texture);
      photoMaterial.map = texture;
      photoMaterial.needsUpdate = true;
      photo.userData.textureLoaded = true;
    }, undefined, () => {
      photo.userData.textureLoaded = false;
      photo.userData.textureFallback = 'warm placeholder';
    });
  }

  const collider = new THREE.Mesh(new THREE.BoxGeometry(3.65, 2.75, 0.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  collider.name = 'photoFrameCollider'; collider.visible = false; collider.userData = { componentId: 'photoFrameCollider', isCollider: true, nonInteractive: true }; root.add(collider);
  root.traverse(object => { object.userData.nonInteractive = true; if (object.isMesh) object.raycast = () => null; });
  root.updateMatrixWorld(true);
  return root;
}
