import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CARPET_DIMENSIONS = Object.freeze({
  width: 5.6,
  depth: 3.733,
  height: 0.08,
  units: 'scene'
});

export const DEFAULT_CARPET_TEXTURE = new URL('./assets/vintage-green-carpet.jpg', import.meta.url).href;

function createFallbackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#455326';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e7d8af';
  ctx.lineWidth = 16;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  ctx.fillStyle = '#d9c999';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height / 2, 120, 92, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#e7d8af';
  ctx.lineWidth = 9;
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2 + Math.cos(a) * 68, canvas.height / 2 + Math.sin(a) * 50, 20, 9, a, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function configureTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);
  texture.rotation = -Math.PI / 2;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function finish(mesh, id, userData = {}) {
  mesh.name = id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { componentId: id, ...userData };
  return mesh;
}

function semanticRegion(parent, id, region) {
  const group = new THREE.Group();
  group.name = id;
  group.userData = {
    componentId: id,
    textureRegion: region,
    explodeWithParent: true,
    textureDriven: true
  };
  parent.add(group);
  return group;
}

export function createCarpetModel(options = {}) {
  const root = new THREE.Group();
  root.name = 'carpet';
  root.userData = {
    id: 'carpet',
    coordinateFrame: { front: '+Z', up: '+Y', origin: 'base center', bottomY: 0 },
    dimensions: CARPET_DIMENSIONS,
    replaceableTexture: options.texturePath || DEFAULT_CARPET_TEXTURE,
    nonInteractive: true,
    animation: { wholeObjectTransform: true, foldApproximation: false },
    sculptRuntime: {
      nodes: ['carpetBase', 'carpetTexturePanel', 'carpetBorderOuter', 'carpetBorderInner', 'carpetTopOrnament', 'carpetBottomOrnament', 'carpetCornerFloralTL', 'carpetCornerFloralTR', 'carpetCornerFloralBL', 'carpetCornerFloralBR', 'carpetCentralMedallion', 'carpetCollider'],
      destructionGroups: { 'woven-shell': ['carpetBase', 'carpetTexturePanel'] },
      colliders: ['carpetCollider'],
      animationAnchors: { root: 'carpet', surface: 'carpetTexturePanel' }
    },
    approximationNotes: [
      'single reference does not reveal underside weave or backing',
      'edge pile and stitch relief use a thin rounded solid approximation'
    ]
  };

  const backingMat = new THREE.MeshStandardMaterial({
    color: 0x332f20,
    roughness: 0.96,
    metalness: 0
  });
  const base = finish(
    new THREE.Mesh(
      new RoundedBoxGeometry(CARPET_DIMENSIONS.width, CARPET_DIMENSIONS.height, CARPET_DIMENSIONS.depth, 0.045, 4),
      backingMat
    ),
    'carpetBase',
    { materialRole: 'woven-backing', replaceable: false }
  );
  base.position.y = CARPET_DIMENSIONS.height / 2;
  root.add(base);

  const fallbackTexture = configureTexture(createFallbackTexture());
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: fallbackTexture,
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const panel = finish(
    new THREE.Mesh(new THREE.PlaneGeometry(CARPET_DIMENSIONS.width - 0.035, CARPET_DIMENSIONS.depth - 0.035), faceMat),
    'carpetTexturePanel',
    {
      materialRole: 'printed-woven-face',
      replaceableTexture: options.texturePath || DEFAULT_CARPET_TEXTURE,
      textureFit: 'full-image-rotated-90deg',
      sourceAspect: '2:3',
      displayedAspect: '3:2'
    }
  );
  panel.rotation.x = -Math.PI / 2;
  panel.position.y = CARPET_DIMENSIONS.height + 0.002;
  panel.castShadow = false;
  root.add(panel);

  const texturePath = options.texturePath || DEFAULT_CARPET_TEXTURE;
  if (texturePath) {
    new THREE.TextureLoader().load(
      texturePath,
      texture => {
        configureTexture(texture);
        faceMat.map = texture;
        faceMat.needsUpdate = true;
        panel.userData.textureLoaded = true;
      },
      undefined,
      () => {
        panel.userData.textureLoaded = false;
        panel.userData.textureFallback = 'generated floral placeholder';
      }
    );
  }

  semanticRegion(root, 'carpetBorderOuter', [0.03, 0.03, 0.94, 0.94]);
  semanticRegion(root, 'carpetBorderInner', [0.08, 0.08, 0.84, 0.84]);
  semanticRegion(root, 'carpetTopOrnament', [0.18, 0.02, 0.64, 0.18]);
  semanticRegion(root, 'carpetBottomOrnament', [0.18, 0.80, 0.64, 0.18]);
  semanticRegion(root, 'carpetCornerFloralTL', [0.03, 0.03, 0.25, 0.25]);
  semanticRegion(root, 'carpetCornerFloralTR', [0.72, 0.03, 0.25, 0.25]);
  semanticRegion(root, 'carpetCornerFloralBL', [0.03, 0.72, 0.25, 0.25]);
  semanticRegion(root, 'carpetCornerFloralBR', [0.72, 0.72, 0.25, 0.25]);
  semanticRegion(root, 'carpetCentralMedallion', [0.27, 0.29, 0.46, 0.42]);

  const collider = new THREE.Mesh(
    new THREE.BoxGeometry(CARPET_DIMENSIONS.width, 0.12, CARPET_DIMENSIONS.depth),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  collider.name = 'carpetCollider';
  collider.position.y = 0.06;
  collider.visible = false;
  collider.userData = { componentId: 'carpetCollider', isCollider: true, nonInteractive: true };
  root.add(collider);

  root.traverse(object => {
    if (object.isMesh) object.userData.nonInteractive = true;
  });
  root.updateMatrixWorld(true);
  return root;
}
