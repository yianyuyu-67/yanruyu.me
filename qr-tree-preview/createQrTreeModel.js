import * as THREE from 'three';

const palette = {
  bark: new THREE.MeshStandardMaterial({ color: 0x6d3f2f, roughness: 0.9 }),
  barkLight: new THREE.MeshStandardMaterial({ color: 0x956047, roughness: 0.92 }),
  barkDark: new THREE.MeshStandardMaterial({ color: 0x4b2a24, roughness: 0.96 }),
  leafA: new THREE.MeshStandardMaterial({ color: 0x63a83f, roughness: 0.98, flatShading: true }),
  leafB: new THREE.MeshStandardMaterial({ color: 0x84c653, roughness: 0.98, flatShading: true }),
  leafC: new THREE.MeshStandardMaterial({ color: 0x4b8f38, roughness: 0.98, flatShading: true }),
  grass: new THREE.MeshStandardMaterial({ color: 0x4d963d, roughness: 1, flatShading: true }),
  soil: new THREE.MeshStandardMaterial({ color: 0xb8a986, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xd8d3c1, roughness: 0.98, flatShading: true }),
  stoneSide: new THREE.MeshStandardMaterial({ color: 0xbcb7a9, roughness: 1 }),
  qrGround: new THREE.MeshStandardMaterial({ color: 0xf1ecdc, roughness: 1 }),
  flower: new THREE.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, roughness: 0.88, flatShading: true })
};

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function mark(object, id, extra = {}) {
  object.name = id;
  object.userData = { ...object.userData, id, ...extra };
  return object;
}

function createBranch(name, points, radius, material, seed = 1) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 10, radius, 7, false);
  const branch = new THREE.Mesh(geometry, material);
  branch.name = name;
  branch.castShadow = true;
  branch.receiveShadow = true;
  const random = seeded(seed);
  branch.rotation.y = (random() - 0.5) * 0.08;
  return branch;
}

function createLeafCluster(index, position, scale, material, seed) {
  const random = seeded(seed);
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const cluster = new THREE.Mesh(geometry, material);
  cluster.name = `leafCluster-${index}`;
  cluster.position.copy(position);
  cluster.scale.set(scale * (0.86 + random() * 0.25), scale * (0.74 + random() * 0.3), scale * (0.78 + random() * 0.24));
  cluster.rotation.set((random() - 0.5) * 0.7, random() * Math.PI * 2, (random() - 0.5) * 0.7);
  cluster.castShadow = true;
  cluster.receiveShadow = true;
  return cluster;
}

function createGrassBlade(index, position, height, seed) {
  const random = seeded(seed);
  const geometry = new THREE.ConeGeometry(0.055, height, 4, 1);
  const blade = new THREE.Mesh(geometry, palette.grass);
  blade.name = `grassBlade-${index}`;
  blade.position.set(position.x, position.y + height / 2, position.z);
  blade.rotation.z = (random() - 0.5) * 0.6;
  blade.rotation.x = (random() - 0.5) * 0.45;
  blade.castShadow = true;
  return blade;
}

function pushFlowerBox(positions, colors, x, y, z, width, height, depth, color) {
  const x0 = x - width / 2;
  const x1 = x + width / 2;
  const y0 = y - height / 2;
  const y1 = y + height / 2;
  const z0 = z - depth / 2;
  const z1 = z + depth / 2;
  const faces = [
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
    [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
    [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
    [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],
    [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],
    [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]
  ];
  faces.forEach(face => {
    [face[0], face[1], face[2], face[0], face[2], face[3]].forEach(vertex => {
      positions.push(...vertex);
      colors.push(...color);
    });
  });
}

function pushFlowerDiamond(positions, colors, x, y, z, radius, thickness, color) {
  const top = [[x, y + thickness / 2, z + radius], [x + radius, y + thickness / 2, z], [x, y + thickness / 2, z - radius], [x - radius, y + thickness / 2, z]];
  const bottom = top.map(([px, py, pz]) => [px, py - thickness, pz]);
  const vertices = [
    [top[0], top[1], top[2]], [top[0], top[2], top[3]],
    [bottom[2], bottom[1], bottom[0]], [bottom[3], bottom[2], bottom[0]],
    [top[0], bottom[0], bottom[1]], [top[0], bottom[1], top[1]],
    [top[1], bottom[1], bottom[2]], [top[1], bottom[2], top[2]],
    [top[2], bottom[2], bottom[3]], [top[2], bottom[3], top[3]],
    [top[3], bottom[3], bottom[0]], [top[3], bottom[0], top[0]]
  ];
  vertices.forEach(face => face.forEach(vertex => {
    positions.push(...vertex);
    colors.push(...color);
  }));
}

function createFlowerGeometry(unit) {
  const positions = [];
  const colors = [];
  const pink = [0.84, 0.28, 0.48];
  const white = [1.0, 0.94, 0.93];
  const core = unit * 0.72;
  const petal = unit * 0.22;
  pushFlowerBox(positions, colors, 0, 0, 0, core, core * 0.78, core, pink);
  [[0, petal * 1.55], [petal * 1.55, 0], [0, -petal * 1.55], [-petal * 1.55, 0]].forEach(([x, z]) => {
    pushFlowerDiamond(positions, colors, x, 0, z, petal, core * 0.34, white);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function sampleBlossomPosition(random, zones) {
  const zone = zones[Math.floor(random() * zones.length)];
  const angle = random() * Math.PI * 2;
  const radial = zone.size * (0.78 + random() * 0.32);
  return new THREE.Vector3(
    zone.x + Math.cos(angle) * radial,
    zone.y + (random() - 0.5) * zone.size * 0.56,
    zone.z + Math.sin(angle) * radial
  );
}

export function createQrTreeModel({ qrMatrix = [], qrPayload = '' } = {}) {
  const root = mark(new THREE.Group(), 'qr-tree', {
    interactive: 'qr-tree',
    label: '二维码树：点击查看二维码',
    sourceModel: 'qr-tree-preview/createQrTreeModel.js',
    style: 'stylized-low-poly',
    qrPayload,
    qrModuleCount: qrMatrix.length
  });

  const pivot = mark(new THREE.Group(), 'qrGardenCenter', { role: 'camera-pivot' });
  root.add(pivot);

  const treeVisual = mark(new THREE.Group(), 'qrTreeVisual', { interactive: 'qr-tree' });
  treeVisual.position.y = -0.72;
  pivot.add(treeVisual);

  const trunk = mark(new THREE.Group(), 'treeTrunk', { role: 'trunk', topologyClass: 'continuous-sculpt' });
  treeVisual.add(trunk);
  const trunkMain = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.72, 2.35, 9), palette.bark);
  trunkMain.name = 'trunkMain';
  trunkMain.position.y = 1.2;
  trunkMain.scale.set(0.82, 1, 0.82);
  trunkMain.rotation.z = -0.045;
  trunkMain.castShadow = true;
  trunkMain.receiveShadow = true;
  trunk.add(trunkMain);
  const rootFlare = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.7, 8), palette.barkDark);
  rootFlare.name = 'rootFlare';
  rootFlare.position.y = 0.42;
  rootFlare.scale.z = 0.82;
  rootFlare.castShadow = true;
  rootFlare.receiveShadow = true;
  trunk.add(rootFlare);
  for (let i = 0; i < 7; i += 1) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.95, 0.08), palette.barkLight);
    ridge.name = `barkRidge-${i}`;
    ridge.position.set(Math.cos(i / 7 * Math.PI * 2) * 0.48, 1.2, Math.sin(i / 7 * Math.PI * 2) * 0.48);
    ridge.rotation.y = i / 7 * Math.PI * 2;
    ridge.castShadow = true;
    trunk.add(ridge);
  }

  const branches = mark(new THREE.Group(), 'primaryBranches', { role: 'branch-system', topologyClass: 'fiber-strand' });
  treeVisual.add(branches);
  const canopyDrop = -2.2;
  const branchData = [
    [[0, 3.45, 0], [-1.05, 5.0, 0.22], [-2.35, 5.6, -0.08]],
    [[0.05, 3.8, 0], [1.12, 5.05, 0.15], [2.3, 5.55, -0.2]],
    [[-0.15, 4.2, 0.05], [-0.32, 5.65, 1.0], [-0.7, 6.2, 1.8]],
    [[0.12, 4.35, -0.04], [0.38, 5.78, -0.95], [0.95, 6.35, -1.75]],
    [[-0.05, 4.85, 0], [-0.85, 6.25, -0.72], [-1.5, 6.8, -1.0]],
    [[0.03, 5.0, 0], [0.95, 6.18, 0.68], [1.65, 6.72, 1.08]]
  ];
  branchData.forEach((points, index) => branches.add(createBranch(`primaryBranch-${index}`, points.map(([x, y, z]) => new THREE.Vector3(x, y + canopyDrop, z)), 0.19 - index * 0.012, index % 2 ? palette.bark : palette.barkLight, 130 + index)));

  const canopy = mark(new THREE.Group(), 'canopyClusters', { role: 'leaf-system', topologyClass: 'continuous-sculpt', interactive: 'qr-tree' });
  treeVisual.add(canopy);
  const clusters = [
    [-2.45, 6.15, -0.2, 1.5, 0], [-1.35, 6.65, 0.75, 1.65, 1], [-0.3, 7.0, 0.05, 1.8, 2],
    [0.95, 6.85, -0.15, 1.7, 3], [2.2, 6.25, 0.05, 1.52, 4], [-1.65, 7.55, -0.6, 1.45, 5],
    [-0.45, 7.8, 0.42, 1.55, 6], [0.9, 7.65, -0.55, 1.42, 7], [-0.1, 8.6, 0.18, 1.35, 8],
    [-2.55, 7.05, 1.15, 1.18, 9], [2.45, 7.2, -0.9, 1.22, 10], [-1.15, 8.35, -0.75, 1.2, 11],
    [1.35, 8.3, 0.62, 1.16, 12], [0.05, 9.25, 0.05, 1.05, 13]
  ];
  clusters.forEach(([x, y, z, size, index]) => canopy.add(createLeafCluster(index, new THREE.Vector3(x, y + canopyDrop, z), size, palette[['leafA', 'leafB', 'leafC'][index % 3]], 300 + index)));
  const blossomZones = clusters.map(([x, y, z, size]) => ({ x, y: y + canopyDrop, z, size }));
  blossomZones.push(
    { x: -2.35, y: 5.65 + canopyDrop, z: -0.08, size: 0.72 },
    { x: 2.3, y: 5.6 + canopyDrop, z: -0.2, size: 0.72 },
    { x: -0.7, y: 6.2 + canopyDrop, z: 1.8, size: 0.56 },
    { x: 0.95, y: 6.35 + canopyDrop, z: -1.75, size: 0.56 }
  );

  const qrGround = mark(new THREE.Mesh(new THREE.PlaneGeometry(7.6, 7.6), palette.qrGround), 'qrGround', {
    role: 'qr-background',
    interactive: 'qr-card',
    sourceTexture: null
  });
  qrGround.rotation.x = -Math.PI / 2;
  qrGround.position.y = 0.36;
  qrGround.scale.setScalar(0.01);
  qrGround.visible = false;
  pivot.add(qrGround);

  const qrDots = mark(new THREE.Group(), 'qrDots', {
    role: 'qr-module-system',
    interactive: 'qr-card',
    topologyClass: 'assembled-solid',
    moduleCount: 0,
    representation: 'pink-white-flower-blossoms'
  });
  pivot.add(qrDots);
  const qrCount = qrMatrix.length;
  if (qrCount > 0) {
    const quietZone = 4;
    const unit = 7.0 / (qrCount + quietZone * 2);
    const total = qrCount + quietZone * 2;
    const flowerGeometry = createFlowerGeometry(unit);
    const random = seeded(9917);
    const flowerInstances = [];
    for (let row = 0; row < qrCount; row += 1) {
      for (let col = 0; col < qrCount; col += 1) {
        if (!qrMatrix[row][col]) continue;
        const source = sampleBlossomPosition(random, blossomZones);
        flowerInstances.push({
          id: `qrModule-${flowerInstances.length}`,
          role: 'qr-module',
          row,
          col,
          sourceRotation: random() * Math.PI * 2,
          sourceScale: 1.55,
          target: { x: (col + quietZone + 0.5 - total / 2) * unit, y: 0.82, z: (row + quietZone + 0.5 - total / 2) * unit },
          source
        });
      }
    }
    const flowerMesh = new THREE.InstancedMesh(flowerGeometry, palette.flower, flowerInstances.length);
    flowerMesh.name = 'qrFlowerInstances';
    flowerMesh.castShadow = true;
    flowerMesh.receiveShadow = true;
    const flowerTransform = new THREE.Object3D();
    flowerInstances.forEach((flower, index) => {
      flowerTransform.position.copy(flower.source);
      flowerTransform.rotation.y = flower.sourceRotation;
      flowerTransform.scale.setScalar(flower.sourceScale);
      flowerTransform.updateMatrix();
      flowerMesh.setMatrixAt(index, flowerTransform.matrix);
    });
    flowerMesh.instanceMatrix.needsUpdate = true;
    qrDots.add(flowerMesh);
    qrDots.userData.instances = flowerInstances;
    qrDots.userData.instanceMesh = flowerMesh;
    qrDots.userData.moduleCount = flowerInstances.length;
    qrDots.userData.gridSize = qrCount;
    qrDots.userData.moduleUnit = unit;
  }

  const hitArea = mark(new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.25, 10.2, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })), 'qrTreeHitArea', {
    interactive: 'qr-tree',
    role: 'hit-area'
  });
  hitArea.position.y = 4.0;
  root.add(hitArea);

  root.userData.bounds = { width: 7.72, depth: 9.72, treeHeight: 8.0, qrAspectRatio: 1, qrModuleCount: qrDots.userData.moduleCount || 0 };
  return root;
}
