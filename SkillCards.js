import * as THREE from 'three';

const CARD_DATA = [
  {
    id: 'visual-design',
    label: '01 / VISUAL DESIGN',
    title: '设计软件',
    subtitle: '用设计工具完成视觉表达、版式与项目素材制作。',
    color: 0x243dde,
    ink: '#fbfbff',
    rows: [
      ['内容制作', 'PS / AI / Pr / 剪映'],
      ['产品设计', 'Figma / ps'],
      ['3D建模', 'Rhino / Sketch Up / CAD']
    ]
  },
  {
    id: 'data-insight',
    label: '02 / DATA & INSIGHT',
    title: '数据分析',
    subtitle: '整理、分析并解释数据，为观察与决策建立清晰依据。',
    color: 0xb9f122,
    ink: '#111722',
    rows: [
      ['ANALYSIS', 'SQL'],
      ['WORKFLOW', 'Excel / VLOOKUP / 数据透视表']
    ]
  },
  {
    id: 'generative-practice',
    label: '03 / GENERATIVE PRACTICE',
    title: 'AI 工具',
    subtitle: '把生成式工具融入研究、视觉试验与创意内容生产。',
    color: 0xfbfbfd,
    ink: '#111722',
    rows: [
      ['IMAGE', '即梦 / 可灵'],
      ['3D', '混元 / Hyper3D'],
      ['LLM / CODING', 'Gemini / GPT / Kimi / Trae / Claude 等']
    ]
  }
];

const DISPLAY_ORDER = [1, 2, 0];

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, startSize, family, weight = 600) {
  let size = startSize;
  while (size > 14) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return size;
}

function shearCardGeometry(geometry, amount) {
  const position = geometry.getAttribute('position');
  for (let index = 0; index < position.count; index += 1) {
    position.setY(index, position.getY(index) - position.getX(index) * amount);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function drawCardTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1160;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const pad = 92;
  const serif = '"Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, serif';
  const sans = 'Inter, Arial, "Noto Sans SC", sans-serif';
  const ink = data.ink;

  ctx.clearRect(0, 0, w, h);
  // The reference uses a soft, generous corner radius on the card face.
  roundedPath(ctx, 20, 20, w - 40, h - 40, 104);
  ctx.fillStyle = data.id === 'visual-design' ? '#243dde' : data.id === 'data-insight' ? '#b9f122' : '#fbfbfd';
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = data.id === 'visual-design' ? 0.18 : 0.22;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.23, w * 0.27, Math.PI * 0.4, Math.PI * 1.18);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ink;
  ctx.font = `700 28px ${sans}`;
  ctx.letterSpacing = '5px';
  ctx.fillText(data.label, pad, 116);
  ctx.letterSpacing = '0px';

  const titleSize = data.id === 'generative-practice' ? 106 : 98;
  ctx.font = `500 ${titleSize}px ${serif}`;
  ctx.fillText(data.title, pad, 310);
  ctx.font = `500 29px ${serif}`;
  ctx.fillText(data.subtitle, pad + 2, 370);

  const tableTop = data.rows.length === 3 ? 650 : 700;
  const rowHeight = data.rows.length === 3 ? 132 : 150;
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pad, tableTop - 28);
  ctx.lineTo(w - pad, tableTop - 28);
  ctx.stroke();
  ctx.globalAlpha = 1;

  data.rows.forEach(([label, value], index) => {
    const y = tableTop + index * rowHeight;
    ctx.fillStyle = ink;
    ctx.font = `700 22px ${sans}`;
    ctx.letterSpacing = '4px';
    ctx.fillText(label, pad, y + 22);
    ctx.letterSpacing = '0px';
    const valueSize = fitText(ctx, value, w - 510, 30, sans, 650);
    ctx.font = `650 ${valueSize}px ${sans}`;
    ctx.fillText(value, 470, y + 22);
    if (index < data.rows.length - 1) {
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad, y + rowHeight - 28);
      ctx.lineTo(w - pad, y + rowHeight - 28);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export class SkillCards {
  constructor({ THREE: three, gsap, root, anchor, camera = null, controls = null, domElement, reducedMotion = false, onTap = null }) {
    this.THREE = three;
    this.gsap = gsap;
    this.root = root;
    this.anchor = anchor;
    this.camera = camera;
    this.controls = controls;
    this.domElement = domElement;
    this.onTap = onTap;
    this.reducedMotion = reducedMotion;
    this.group = new three.Group();
    this.group.name = 'skillCardsStage';
    this.group.renderOrder = 100;
    this.group.visible = false;
    this.group.userData = { interactive: 'skill-cards-stage', id: 'skillCardsStage' };
    this.cards = [];
    this.cardWidth = 5.2;
    this.cardHeight = 5.05;
    this.cardShear = 0.095;
    this.presentationDistance = 6.5;
    this.index = -1;
    this.isOpen = false;
    this.isAnimating = false;
    this.transitionCall = null;
    this.transitionTimer = null;
    this.anchorPoint = new three.Vector3();
    this.pointerStart = null;
    this._onPointerDown = event => this.handlePointerDown(event);
    this._onPointerUp = event => this.handlePointerUp(event);
  }

  mount() {
    const { THREE } = this;
    this.root.add(this.group);
    const cardWidth = this.cardWidth;
    const cardHeight = this.cardHeight;
    // Give the rounded solid body enough thickness to read as a foreground
    // card while keeping its face visually flat to the camera.
    // Keep the cards paper-thin so their physical volumes cannot intersect
    // while the visible faces still overlap like the reference stack.
    const cardDepth = 0.08;
    const bodyRadius = 0.42;

    CARD_DATA.forEach(data => {
      const card = this.createSolidCard(`skillCard-${data.id}`, data.color, cardWidth, cardHeight, cardDepth, bodyRadius, this.cardShear);
      const face = this.createFace(card, drawCardTexture(data), cardWidth - 0.15, cardHeight - 0.15, cardDepth / 2 + 0.012, this.cardShear);
      card.add(face);
      card.userData = { interactive: 'skill-card', id: data.id, label: data.title, skillCardId: data.id };
      card.userData.baseScale = new THREE.Vector3(1, 1, 1);
      card.userData.basePosition = new THREE.Vector3();
      card.userData.baseRotation = new THREE.Euler();
      card.castShadow = true;
      card.receiveShadow = true;
      face.renderOrder = 101;
      this.group.add(card);
      this.cards.push({ data, mesh: card, face, texture: face.material.map });
    });

    if (this.domElement) {
      this.domElement.addEventListener('pointerdown', this._onPointerDown, { passive: true });
      this.domElement.addEventListener('pointerup', this._onPointerUp, { passive: true });
    }
    return this;
  }

  createSolidCard(name, color, width, height, depth, radius, shear = 0) {
    const geometry = shearCardGeometry(this.createRoundedCardGeometry(width, height, depth, radius), shear);
    // Skill cards are a foreground presentation layer and must not be
    // occluded by cabinet objects or the photo behind them.
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.02,
      // Put the cards in the transparent foreground queue so they render
      // after the sign's transparent lettering. Depth is disabled below so
      // no scene mesh can punch through this presentation layer.
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createRoundedCardGeometry(width, height, depth, radius) {
    const { THREE } = this;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const r = Math.min(radius, halfWidth, halfHeight);
    const left = -halfWidth;
    const right = halfWidth;
    const bottom = -halfHeight;
    const top = halfHeight;
    const shape = new THREE.Shape();

    // Build one continuous rounded outline and extrude it. This avoids the
    // uneven corner sampling caused by beveling a very shallow box.
    shape.moveTo(left + r, bottom);
    shape.lineTo(right - r, bottom);
    shape.absarc(right - r, bottom + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(right, top - r);
    shape.absarc(right - r, top - r, r, 0, Math.PI / 2, false);
    shape.lineTo(left + r, top);
    shape.absarc(left + r, top - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(left, bottom + r);
    shape.absarc(left + r, bottom + r, r, Math.PI, Math.PI * 1.5, false);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 32
    });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  createFace(parent, texture, width, height, z, shear = 0) {
    const { THREE } = this;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      // Alpha-test the transparent corners instead of using the transparent
      // render queue, so the face and its border sort as one card layer.
      transparent: true,
      opacity: 1,
      alphaTest: 0.02,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const face = new THREE.Mesh(shearCardGeometry(new THREE.PlaneGeometry(width, height), shear), material);
    face.position.z = z;
    face.frustumCulled = false;
    face.castShadow = true;
    face.receiveShadow = true;
    parent.add(face);
    return face;
  }

  resolveAnchor() {
    const { THREE } = this;
    if (this.camera && this.controls) {
      // Place the complete stack on the camera plane. Anchoring to a cabinet
      // or sign bounds makes the cards drift when that object is off-center.
      const forward = this.camera.getWorldDirection(new THREE.Vector3());
      const screenCenter = this.camera.getWorldPosition(new THREE.Vector3())
        .addScaledVector(forward, this.presentationDistance);
      const layout = this.getLayoutBounds();
      const layoutCenter = new THREE.Vector3(layout.center.x, layout.center.y, 0)
        .multiplyScalar(this.group.scale.x)
        .applyQuaternion(this.group.quaternion);
      const groupPosition = screenCenter.clone().sub(layoutCenter);
      this.root.worldToLocal(groupPosition);
      this.anchorPoint.copy(groupPosition);
      return;
    }
    if (!this.anchor) {
      this.anchorPoint.set(5, 7.8, -4.2);
      return;
    }
    this.anchor.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(this.anchor);
    box.getCenter(this.anchorPoint);
    this.anchorPoint.y -= 2.4;
    this.anchorPoint.z += 1.12;
  }

  getLayoutBounds() {
    const halfWidth = this.cardWidth / 2;
    const halfHeight = this.cardHeight / 2;
    const shearOffset = halfWidth * this.cardShear;
    const slots = [
      { x: 0, y: -0.22 },
      { x: 0.46, y: 0.48 },
      { x: 0.74, y: 1.02 }
    ];
    const minX = Math.min(...slots.map(slot => slot.x - halfWidth));
    const maxX = Math.max(...slots.map(slot => slot.x + halfWidth));
    const minY = Math.min(...slots.map(slot => slot.y - halfHeight - shearOffset));
    const maxY = Math.max(...slots.map(slot => slot.y + halfHeight + shearOffset));
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    };
  }

  resolvePresentationScale() {
    if (!this.camera) return window.innerWidth < 600 ? 0.56 : 1;
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const viewHeight = 2 * this.presentationDistance * Math.tan(verticalFov / 2);
    const viewWidth = viewHeight * this.camera.aspect;
    const layout = this.getLayoutBounds();
    const horizontalFit = viewWidth * (window.innerWidth < 600 ? 0.84 : 0.78) / layout.width;
    const verticalFit = viewHeight * (window.innerWidth < 600 ? 0.80 : 0.84) / layout.height;
    return Math.min(horizontalFit, verticalFit);
  }

  refreshLayout() {
    if (!this.isOpen || !this.camera || !this.controls) return;
    const { THREE } = this;
    this.presentationDistance = THREE.MathUtils.clamp(
      this.camera.position.distanceTo(this.controls.target) * 0.5,
      window.innerWidth < 600 ? 4.8 : 5.8,
      window.innerWidth < 600 ? 6.4 : 8
    );
    this.group.scale.setScalar(this.resolvePresentationScale());
    this.camera.updateWorldMatrix(true, false);
    const cameraWorldQuaternion = this.camera.getWorldQuaternion(new THREE.Quaternion());
    const rootWorldQuaternion = this.root.getWorldQuaternion(new THREE.Quaternion());
    this.group.quaternion.copy(rootWorldQuaternion.invert().multiply(cameraWorldQuaternion));
    this.resolveAnchor();
    this.group.position.copy(this.anchorPoint);
  }

  open() {
    if (!this.cards.length) this.mount();
    const { THREE } = this;
    this.isOpen = true;
    this.index = -1;
    this.isAnimating = false;
    this.group.visible = true;
    this.cards.forEach(card => { card.mesh.visible = false; });
    // Fit the complete three-card stack into the viewport and center its
    // actual bounds, rather than centering only the active card.
    this.presentationDistance = THREE.MathUtils.clamp(
      this.camera.position.distanceTo(this.controls.target) * 0.5,
      window.innerWidth < 600 ? 4.8 : 5.8,
      window.innerWidth < 600 ? 6.4 : 8
    );
    this.group.scale.setScalar(this.resolvePresentationScale());
    this.camera.updateWorldMatrix(true, false);
    const cameraWorldQuaternion = this.camera.getWorldQuaternion(new THREE.Quaternion());
    const rootWorldQuaternion = this.root.getWorldQuaternion(new THREE.Quaternion());
    this.group.quaternion.copy(rootWorldQuaternion.invert().multiply(cameraWorldQuaternion));
    this.resolveAnchor();
    this.group.position.copy(this.anchorPoint);
    // The title board from the reference is intentionally omitted: opening a
    // certificate now reveals the three-card stack directly.
    this.transitionTo(DISPLAY_ORDER[0], 1);
  }

  close() {
    if (!this.isOpen) return;
    const { gsap } = this;
    this.transitionCall?.kill();
    this.transitionCall = null;
    window.clearTimeout(this.transitionTimer);
    this.transitionTimer = null;
    gsap.killTweensOf(this.group.position);
    gsap.killTweensOf(this.group.scale);
    this.cards.forEach(card => {
      gsap.killTweensOf(card.mesh.position);
      gsap.killTweensOf(card.mesh.rotation);
      gsap.killTweensOf(card.mesh.scale);
      card.mesh.visible = false;
    });
    this.group.visible = false;
    this.isOpen = false;
    this.index = -1;
    this.isAnimating = false;
    this.group.userData.skillCardIndex = -1;
    this.publishState();
  }

  next() {
    if (!this.isOpen || this.isAnimating) return;
    const nextIndex = this.index === -1 ? DISPLAY_ORDER[0] : DISPLAY_ORDER[(DISPLAY_ORDER.indexOf(this.index) + 1) % DISPLAY_ORDER.length];
    this.transitionTo(nextIndex, 1);
  }

  previous() {
    if (!this.isOpen || this.isAnimating) return;
    const previousIndex = this.index === -1 ? DISPLAY_ORDER[DISPLAY_ORDER.length - 1] : DISPLAY_ORDER[(DISPLAY_ORDER.indexOf(this.index) - 1 + DISPLAY_ORDER.length) % DISPLAY_ORDER.length];
    this.transitionTo(previousIndex, -1);
  }

  transitionTo(nextIndex, direction) {
    const { THREE, gsap } = this;
    const duration = this.reducedMotion ? 0.01 : 0.68;
    this.isAnimating = true;
    this.cards.forEach(card => { card.mesh.visible = true; });

    // All cards use the same left-high/right-low parallelogram geometry.
    // Their face-normal rotation remains zero, so vertical details stay
    // vertical and the three cards remain parallel.
    const activeRotation = 0;
    const slotByIndex = new Map();
    const orderPosition = DISPLAY_ORDER.indexOf(nextIndex);
    const backIndex = DISPLAY_ORDER[(orderPosition - 1 + DISPLAY_ORDER.length) % DISPLAY_ORDER.length];
    const middleIndex = DISPLAY_ORDER[(orderPosition + 1) % DISPLAY_ORDER.length];
    // Separate the actual card bodies by more than their thickness. The
    // projected overlap remains, but no border can physically cut through a
    // neighboring card.
    slotByIndex.set(nextIndex, { x: 0, y: -0.22, z: 0.14, scale: 1, rotation: activeRotation, opacity: 1 });
    slotByIndex.set(middleIndex, { x: 0.46, y: 0.48, z: 0, scale: 1, rotation: 0, opacity: 1 });
    slotByIndex.set(backIndex, { x: 0.74, y: 1.02, z: -0.14, scale: 1, rotation: 0, opacity: 1 });

    this.cards.forEach(({ mesh }, cardIndex) => {
      const slot = slotByIndex.get(cardIndex);
      mesh.userData.basePosition.set(slot.x, slot.y, slot.z);
      mesh.userData.baseRotation.set(0, 0, slot.rotation);
      mesh.userData.baseScale.set(slot.scale, slot.scale, slot.scale);
      mesh.renderOrder = cardIndex === nextIndex ? 108 : cardIndex === middleIndex ? 106 : 104;
      // Keep a card's border and print together. The face is only one draw
      // step above its body, while the next card layer is ten steps away.
      mesh.children.forEach(child => { child.renderOrder = mesh.renderOrder + 1; });
      gsap.killTweensOf([mesh.position, mesh.rotation, mesh.scale]);
      const fromActive = this.index === cardIndex;
      const isIncoming = this.index !== -1 && nextIndex === cardIndex && direction > 0;
      const start = {
        x: fromActive ? mesh.position.x : isIncoming ? slot.x : mesh.position.x,
        y: fromActive ? mesh.position.y - 1.5 : isIncoming ? slot.y + 1.45 : mesh.position.y,
        z: fromActive ? mesh.position.z - 0.08 : isIncoming ? slot.z - 0.08 : mesh.position.z,
        scale: fromActive ? mesh.scale.x * 0.86 : isIncoming ? slot.scale * 0.84 : mesh.scale.x,
        rotation: 0
      };
      if (this.index === -1) {
        start.x = slot.x;
        start.y = slot.y + 1.15;
        start.z = slot.z - 0.08;
        start.scale = slot.scale * 0.86;
        start.rotation = 0;
      }
      mesh.position.set(start.x, start.y, start.z);
      mesh.scale.setScalar(start.scale);
      mesh.rotation.set(0, 0, start.rotation);
      gsap.to(mesh.position, { x: slot.x, y: slot.y, z: slot.z, duration, ease: 'power3.out' });
      gsap.to(mesh.scale, { x: slot.scale, y: slot.scale, z: slot.scale, duration, ease: 'power3.out' });
      gsap.to(mesh.rotation, { x: 0, y: 0, z: slot.rotation, duration, ease: 'power3.out' });
    });

    this.index = nextIndex;
    this.group.userData.skillCardIndex = this.index;
    this.group.userData.activeSkillCard = CARD_DATA[nextIndex].id;
    this.transitionCall?.kill();
    this.transitionCall = null;
    window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      this.isAnimating = false;
      this.publishState();
    }, Math.max(40, duration * 1000 + 80));
    this.publishState();
  }

  handlePointerDown(event) {
    if (!this.isOpen || event.pointerType === 'mouse' && event.button !== 0) return;
    this.pointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  }

  handlePointerUp(event) {
    if (!this.isOpen || !this.pointerStart || event.pointerId !== this.pointerStart.pointerId) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    this.pointerStart = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) this.onTap ? this.onTap(event) : this.next();
    else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 32) dx < 0 ? this.next() : this.previous();
  }

  publishState() {
    document.body.dataset.skillCardsState = JSON.stringify({
      open: this.isOpen,
      index: this.index,
      active: this.index === -1 ? 'cover' : CARD_DATA[this.index].id,
      animating: this.isAnimating
    });
  }

  destroy() {
    this.transitionCall?.kill();
    window.clearTimeout(this.transitionTimer);
    if (this.domElement) {
      this.domElement.removeEventListener('pointerdown', this._onPointerDown);
      this.domElement.removeEventListener('pointerup', this._onPointerUp);
    }
    this.cards.forEach(({ mesh, texture }) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.children.forEach(child => { child.geometry.dispose(); child.material.dispose(); });
      texture.dispose();
    });
    this.root.remove(this.group);
  }
}
