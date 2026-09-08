import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const paperMat = new THREE.MeshStandardMaterial({ color: 0xf1e7cf, roughness: 0.94 });
const inkMat = new THREE.MeshStandardMaterial({ color: 0x3b3833, roughness: 0.9 });

function sheetTexture(index) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 360;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = index === 0 ? '#efe5cf' : '#e7dcc3'; ctx.fillRect(0, 0, 512, 360);
  ctx.fillStyle = '#312f2a'; ctx.font = 'bold 34px Georgia'; ctx.fillText(index === 0 ? 'THE LODGE' : 'STAGE NOTES', 24, 48);
  ctx.strokeStyle = '#6d6254'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24, 62); ctx.lineTo(488, 62); ctx.stroke();
  for (let col = 0; col < 3; col++) {
    const x = 24 + col * 156; ctx.fillStyle = '#4b463e';
    for (let row = 0; row < 11; row++) ctx.fillRect(x, 82 + row * 18, 126 - (row % 3) * 14, 3);
  }
  ctx.fillStyle = '#b7a68a'; ctx.fillRect(340, 92, 140, 82);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

export function createNewspaperModel() {
  const root = new THREE.Group(); root.name = 'newspaper';
  root.userData = { id: 'newspaper', interactive: 'newspaper', replaceable: true, dimensions: { width: 2.8, depth: 1.9, height: 0.22 } };
  const pages = new THREE.Group(); pages.name = 'pages'; root.add(pages);
  for (let i = 0; i < 3; i += 1) {
    const material = paperMat.clone(); material.map = sheetTexture(i % 2); material.needsUpdate = true;
    const page = new THREE.Mesh(new RoundedBoxGeometry(2.8 - i * 0.08, 0.055, 1.9 - i * 0.06, 2, 0.035), material);
    page.name = `paperPage${i + 1}`; page.position.set(i * 0.04, i * 0.07, i * 0.035); page.rotation.y = (i - 1) * 0.025; page.castShadow = true; page.receiveShadow = true;
    page.userData = { id: 'newspaper', interactive: 'newspaper', pageIndex: i, replaceableTexture: true }; pages.add(page);
  }
  const fold = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.06, 0.08, 2, 0.025), inkMat);
  fold.name = 'newspaperFold'; fold.position.set(0.65, 0.22, 0.02); fold.rotation.y = -0.08; pages.add(fold);
  root.userData.sculptRuntime = { coordinateFrame: 'bottom at y=0, front +Z', pageCount: 3, animationHooks: ['expand', 'turnPage'] };
  return root;
}
