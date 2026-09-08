import * as THREE from 'three';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function drawCoverImage(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}

function makeCardTexture(image) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4eadb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1f2528';
  ctx.fillRect(0, 0, canvas.width, 84);
  ctx.fillStyle = '#c58d62';
  ctx.fillRect(0, 84, canvas.width, 10);

  ctx.fillStyle = '#f8f0e4';
  ctx.font = '600 22px Arial, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('PERSONAL ARCHIVE  /  ABOUT ME', 38, 52);

  const photoX = 48;
  const photoY = 138;
  const photoSize = 270;
  ctx.fillStyle = '#d5b89d';
  ctx.fillRect(photoX - 8, photoY - 8, photoSize + 16, photoSize + 16);
  if (image.complete && image.naturalWidth) drawCoverImage(ctx, image, photoX, photoY, photoSize, photoSize);
  ctx.strokeStyle = '#1f2528';
  ctx.lineWidth = 4;
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  ctx.fillStyle = '#9a6b4b';
  ctx.font = '600 23px Arial, sans-serif';
  ctx.fillText('Yan Ruyu', 364, 300);
  ctx.fillStyle = '#1f2528';
  ctx.font = '700 68px Arial, "Microsoft YaHei", sans-serif';
  // Keep the Chinese name below the romanization and level its baseline with
  // the bottom edge of the square portrait.
  ctx.fillText('闫茹玉', 360, 408);

  ctx.strokeStyle = '#c8b7a4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 468);
  ctx.lineTo(672, 468);
  ctx.stroke();

  // Keep education in its own compact block so the school and two degrees
  // remain easy to scan without competing with the contact details below.
  ctx.fillStyle = '#9a6b4b';
  ctx.font = '700 18px Arial, sans-serif';
  ctx.fillText('EDUCATION', 48, 520);
  ctx.fillStyle = '#1f2528';
  ctx.font = '26px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('北京林业大学（211）', 48, 568);
  ctx.font = '24px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('本科', 48, 612);
  ctx.fillText('园林专业', 154, 612);
  ctx.fillText('硕士', 48, 652);
  ctx.fillText('风景园林专业', 154, 652);

  ctx.strokeStyle = '#c8b7a4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 684);
  ctx.lineTo(672, 684);
  ctx.stroke();
  ctx.fillStyle = '#9a6b4b';
  ctx.font = '700 18px Arial, sans-serif';
  ctx.fillText('CONTACT', 48, 724);
  ctx.fillStyle = '#1f2528';
  ctx.font = '27px Arial, "Microsoft YaHei", sans-serif';
  ctx.fillText('邮箱：', 48, 766);
  ctx.fillText('19845118108@163.com', 170, 766);
  ctx.fillText('电话：', 48, 806);
  ctx.fillText('19845118108', 170, 806);
  ctx.fillStyle = '#9a6b4b';
  ctx.font = '700 18px Arial, sans-serif';
  ctx.fillText('YDA / 2026', 48, 862);
  ctx.fillStyle = '#8b8178';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('DRAG THE CARD', 510, 862);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeWovenLanyardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const diagonal = (x * 0.38 + y * 0.72) % 10;
      const crossWeave = (x * 0.72 - y * 0.28) % 15;
      const edgeFade = Math.min(x / 15, (canvas.width - x) / 15, 1);
      const thread = diagonal < 2.2 ? 14 : crossWeave < 1.4 ? 8 : 0;
      const grain = ((x * 17 + y * 23) % 11) - 5;
      const base = clamp(20 + thread + grain * 0.65, 10, 44) * (0.72 + edgeFade * 0.28);
      image.data[index] = base * 0.78;
      image.data[index + 1] = base * 0.84;
      image.data[index + 2] = base * 0.93;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.fillStyle = 'rgba(255, 255, 255, .12)';
  ctx.fillRect(16, 0, 2, canvas.height);
  ctx.fillRect(canvas.width - 18, 0, 2, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, .32)';
  ctx.fillRect(0, 0, 8, canvas.height);
  ctx.fillRect(canvas.width - 8, 0, 8, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRibbonGeometry(sampleCount) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(sampleCount * 4 * 3);
  const uvs = new Float32Array(sampleCount * 4 * 2);
  const indices = [];
  for (let i = 0; i < sampleCount - 1; i += 1) {
    const current = i * 4;
    const next = (i + 1) * 4;
    indices.push(
      current, next, current + 1, current + 1, next, next + 1,
      current + 1, next + 1, next + 2, current + 1, next + 2, current + 2,
      current + 2, next + 2, next + 3, current + 2, next + 3, current + 3,
      current + 3, next + 3, next, current + 3, next, current
    );
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function createHookGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -13, 0), new THREE.Vector3(0, -22, 0), new THREE.Vector3(5, -28, 0),
    new THREE.Vector3(8, -34, 0), new THREE.Vector3(5, -39, 0), new THREE.Vector3(0, -40, 0),
    new THREE.Vector3(-3, -36, 0)
  ]);
  return new THREE.TubeGeometry(curve, 30, 2.3, 8, false);
}

export class LanyardCard {
  constructor({ overlay, canvas, closeButton, photoUrl, reducedMotion = false, onClose } = {}) {
    this.overlay = overlay;
    this.canvas = canvas;
    this.closeButton = closeButton;
    this.photoUrl = photoUrl;
    this.reducedMotion = reducedMotion;
    this.onClose = onClose;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.z = 10;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x111723, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.9);
    keyLight.position.set(-160, 280, 260);
    this.scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x9db8dd, 1.6);
    rimLight.position.set(180, 40, 180);
    this.scene.add(rimLight);

    this.anchor = new THREE.Vector2();
    this.position = new THREE.Vector2();
    this.pointerOffset = new THREE.Vector2();
    this.dragTarget = new THREE.Vector2();
    this.dragVelocity = new THREE.Vector2();
    this.nodes = Array.from({ length: 6 }, () => new THREE.Vector2());
    this.previousNodes = Array.from({ length: 6 }, () => new THREE.Vector2());
    this.curvePoints = Array.from({ length: 6 }, () => new THREE.Vector3());
    this.dragging = false;
    this.opened = false;
    this.frame = 0;
    this.lastTime = performance.now();
    this.lastDragTime = 0;
    this.cardWidth = 280;
    this.cardHeight = 358;
    this.strapLength = 70;
    this.maxDragLength = 320;
    this.deployedLength = 0;
    this.introActive = false;
    this.introElapsed = 0;
    this.introDuration = 0.96;
    this.strapWidth = 18;
    this.hookDrop = 42;
    this.photo = new Image();
    this.photo.onload = () => {
      if (this.cardMaterial) {
        this.cardMaterial.map?.dispose();
        this.cardMaterial.map = makeCardTexture(this.photo);
        this.cardMaterial.needsUpdate = true;
      }
    };
    this.photo.src = photoUrl;
    this.setupScene();
    this.bindEvents();
    this.resize();
  }

  setupScene() {
    this.cardMaterial = new THREE.MeshBasicMaterial({ map: makeCardTexture(this.photo), side: THREE.DoubleSide });
    this.card = new THREE.Mesh(new THREE.PlaneGeometry(280, 358), this.cardMaterial);
    this.card.position.z = 1.2;
    this.scene.add(this.card);

    this.wovenTexture = makeWovenLanyardTexture();
    this.ribbonGeometry = createRibbonGeometry(42);
    this.ribbon = new THREE.Mesh(this.ribbonGeometry, new THREE.MeshStandardMaterial({
      map: this.wovenTexture, roughness: 0.52, metalness: 0.08, side: THREE.DoubleSide
    }));
    this.ribbon.frustumCulled = false;
    this.scene.add(this.ribbon);

    this.hardwareMaterial = new THREE.MeshStandardMaterial({ color: 0x11151b, roughness: 0.23, metalness: 0.86 });
    this.hardwareAccentMaterial = new THREE.MeshStandardMaterial({ color: 0x4f5965, roughness: 0.28, metalness: 0.92 });
    this.anchorHardware = new THREE.Group();
    const anchorPlate = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 6), this.hardwareMaterial);
    anchorPlate.position.set(0, -7, 1.25);
    const anchorRing = new THREE.Mesh(new THREE.TorusGeometry(7, 1.8, 8, 28), this.hardwareAccentMaterial);
    anchorRing.position.set(0, -5, 4.6);
    this.anchorHardware.add(anchorPlate, anchorRing);
    this.scene.add(this.anchorHardware);

    this.claspHardware = new THREE.Group();
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 7), this.hardwareMaterial);
    clasp.position.set(0, -5, 1.55);
    const claspSlot = new THREE.Mesh(new THREE.BoxGeometry(21, 4.2, 7.5), this.hardwareAccentMaterial);
    claspSlot.position.set(0, -3.8, 5.05);
    const hook = new THREE.Mesh(createHookGeometry(), this.hardwareAccentMaterial);
    hook.position.z = 3;
    this.claspHardware.add(clasp, claspSlot, hook);
    this.scene.add(this.claspHardware);
  }

  bindEvents() {
    this.onPointerDown = (event) => {
      if (!this.opened) return;
      const point = this.toWorld(event.clientX, event.clientY);
      if (Math.abs(point.x - this.position.x) > this.cardWidth / 2 || Math.abs(point.y - this.position.y) > this.cardHeight / 2) return;
      this.introActive = false;
      this.dragging = true;
      this.pointerOffset.set(this.position.x - point.x, this.position.y - point.y);
      this.dragTarget.copy(this.position);
      this.dragVelocity.set(0, 0);
      this.lastDragTime = performance.now();
      this.canvas.setPointerCapture?.(event.pointerId);
      this.canvas.classList.add('is-dragging');
      event.preventDefault();
    };
    this.onPointerMove = (event) => {
      if (!this.dragging) return;
      const target = this.toWorld(event.clientX, event.clientY).add(this.pointerOffset);
      const bounds = this.getDragBounds();
      target.x = clamp(target.x, bounds.minX, bounds.maxX);
      target.y = clamp(target.y, bounds.minY, bounds.maxY);
      const elapsed = Math.max(0.008, (performance.now() - this.lastDragTime) / 1000);
      this.dragVelocity.copy(target).sub(this.dragTarget).multiplyScalar(1 / elapsed).clampLength(0, 1500);
      this.dragTarget.copy(target);
      this.lastDragTime = performance.now();
      event.preventDefault();
    };
    this.onPointerUp = (event) => {
      if (!this.dragging) return;
      this.dragging = false;
      const end = this.nodes[this.nodes.length - 1];
      this.previousNodes[this.previousNodes.length - 1].copy(end).addScaledVector(this.dragVelocity, -0.014);
      this.canvas.releasePointerCapture?.(event.pointerId);
      this.canvas.classList.remove('is-dragging');
    };
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.closeButton?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('pointerdown', (event) => { if (event.target === this.overlay) this.close(); });
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.viewport = { width, height };
    this.renderer.setSize(width, height, false);
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();
    this.cardWidth = clamp(width * 0.26, 220, 290);
    this.cardHeight = this.cardWidth * 1.28;
    this.card.scale.set(this.cardWidth / 280, this.cardHeight / 358, 1);
    // A straight hanging strap places the card at the viewport center. It
    // stays short on compact screens so the card remains readable there too.
    this.strapLength = clamp(
      height / 2 + 40 - (this.hookDrop + this.cardHeight / 2),
      32,
      height * 0.55
    );
    // Let the card travel across most of the viewport while keeping a compact
    // resting hang. The strap extends only while it is being dragged.
    this.maxDragLength = clamp(height * 0.88, 300, 680);
    this.strapWidth = clamp(this.cardWidth * 0.065, 15, 20);
    if (!this.opened) this.position.set(0, 0);
  }

  toWorld(clientX, clientY) {
    return new THREE.Vector2(clientX - this.viewport.width / 2, this.viewport.height / 2 - clientY);
  }

  cardCenterFromEnd(end) {
    return this.position.copy(end).add(new THREE.Vector2(0, -(this.hookDrop + this.cardHeight / 2)));
  }

  endFromCardCenter(center, target = new THREE.Vector2()) {
    return target.copy(center).add(new THREE.Vector2(0, this.hookDrop + this.cardHeight / 2));
  }

  getDragBounds() {
    const visibleX = clamp(this.cardWidth * 0.3, 58, 84);
    const visibleY = clamp(this.cardHeight * 0.24, 64, 88);
    return {
      minX: -this.viewport.width / 2 + visibleX,
      maxX: this.viewport.width / 2 - visibleX,
      minY: -this.viewport.height / 2 + visibleY,
      maxY: this.viewport.height / 2 - visibleY
    };
  }

  resetNodes() {
    for (let i = 0; i < this.nodes.length; i += 1) {
      this.nodes[i].copy(this.anchor).add(new THREE.Vector2(0, -i * 2));
      this.previousNodes[i].copy(this.nodes[i]);
    }
  }

  open() {
    this.resize();
    this.opened = true;
    this.overlay?.classList.add('show');
    this.overlay?.setAttribute('aria-hidden', 'false');
    // The physical attachment stays beyond the viewport; only the woven strap
    // enters from the top edge of the screen.
    this.anchor.set(0, this.viewport.height / 2 + 40);
    this.deployedLength = this.reducedMotion ? this.strapLength : 8;
    this.introActive = !this.reducedMotion;
    this.introElapsed = 0;
    this.dragging = false;
    this.dragVelocity.set(0, 0);
    this.card.rotation.z = 0;
    this.resetNodes();
    this.updateVisuals(0);
    this.lastTime = performance.now();
    this.closeButton?.focus();
    if (!this.frame) this.frame = requestAnimationFrame((time) => this.tick(time));
  }

  close() {
    if (!this.opened) return false;
    this.opened = false;
    this.introActive = false;
    this.dragging = false;
    this.canvas.classList.remove('is-dragging');
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.overlay?.classList.remove('show');
    this.overlay?.setAttribute('aria-hidden', 'true');
    this.onClose?.();
    return true;
  }

  solveConstraints(segmentLength, iterations = 7) {
    for (let pass = 0; pass < iterations; pass += 1) {
      this.nodes[0].copy(this.anchor);
      for (let i = 0; i < this.nodes.length - 1; i += 1) {
        const first = this.nodes[i];
        const second = this.nodes[i + 1];
        let dx = second.x - first.x;
        let dy = second.y - first.y;
        let distance = Math.hypot(dx, dy);
        if (distance < 0.001) {
          dx = 0;
          dy = -1;
          distance = 1;
        }
        const correction = (distance - segmentLength) / distance;
        if (i === 0) {
          second.x -= dx * correction;
          second.y -= dy * correction;
        } else {
          first.x += dx * correction * 0.5;
          first.y += dy * correction * 0.5;
          second.x -= dx * correction * 0.5;
          second.y -= dy * correction * 0.5;
        }
      }
    }
  }

  constrainCardToViewport() {
    const end = this.nodes[this.nodes.length - 1];
    const center = this.cardCenterFromEnd(end).clone();
    const bounds = this.getDragBounds();
    const limitedX = clamp(center.x, bounds.minX, bounds.maxX);
    const limitedY = clamp(center.y, bounds.minY, bounds.maxY);
    if (limitedX === center.x && limitedY === center.y) return;
    end.x += limitedX - center.x;
    end.y += limitedY - center.y;
    this.previousNodes[this.previousNodes.length - 1].copy(end);
  }

  updatePhysics(delta) {
    const endIndex = this.nodes.length - 1;
    const wasIntroActive = this.introActive;
    if (!this.reducedMotion && this.introActive && !this.dragging) {
      this.introElapsed += delta;
      const progress = Math.min(1, this.introElapsed / this.introDuration);
      // One quick drop with a single shallow overshoot, matching the short
      // settle in the reference instead of a repeated vertical bounce.
      const damping = 7;
      const frequency = 8.5;
      const drop = 1 - Math.exp(-damping * progress) * (
        Math.cos(frequency * progress) + (damping / frequency) * Math.sin(frequency * progress)
      );
      this.deployedLength = Math.max(8, this.strapLength * drop);
      // Use one dominant side swing and a much smaller reverse correction. The
      // two phases have different timing and amplitude, so it does not read as
      // a perfectly even left-right oscillator.
      const primaryProgress = clamp(progress / 0.58, 0, 1);
      const primarySwing = Math.sin(primaryProgress * Math.PI) * (1 - progress * 0.28);
      const correctionProgress = clamp((progress - 0.52) / 0.48, 0, 1);
      const reverseCorrection = Math.sin(correctionProgress * Math.PI) * 0.22;
      const desiredSway = (primarySwing - reverseCorrection) * this.cardWidth * 0.30;
      const maxSway = Math.max(0, this.deployedLength - 3);
      const sway = clamp(desiredSway, -maxSway, maxSway);
      const verticalDrop = Math.sqrt(Math.max(0, this.deployedLength ** 2 - sway ** 2));
      const end = this.nodes[endIndex];
      this.previousNodes[endIndex].copy(end);
      end.set(this.anchor.x + sway, this.anchor.y - verticalDrop);
      if (progress === 1) {
        this.introActive = false;
        this.deployedLength = this.strapLength;
      }
    } else if (!this.reducedMotion && !this.dragging) {
      this.deployedLength += (this.strapLength - this.deployedLength) * Math.min(1, delta * 4.2);
    }
    if (this.reducedMotion) this.deployedLength = this.strapLength;
    if (this.dragging) {
      const end = this.endFromCardCenter(this.dragTarget);
      const requiredLength = this.anchor.distanceTo(end) + 10;
      this.deployedLength = clamp(requiredLength, this.strapLength, this.maxDragLength);
      this.nodes[endIndex].copy(end);
      this.previousNodes[endIndex].copy(end);
    } else if (!this.reducedMotion && !this.introActive) {
      const damping = Math.pow(0.87, delta * 60);
      for (let i = 1; i < this.nodes.length; i += 1) {
        const node = this.nodes[i];
        const previous = this.previousNodes[i];
        const velocityX = (node.x - previous.x) * damping;
        const velocityY = (node.y - previous.y) * damping;
        previous.copy(node);
        node.x += velocityX;
        node.y += velocityY - 980 * delta * delta;
      }
    }
    const segmentLength = Math.max(1.8, this.deployedLength / (this.nodes.length - 1));
    this.solveConstraints(segmentLength);
    this.constrainCardToViewport();
    this.solveConstraints(segmentLength, 3);
    // The intro path is authored directly. Reset Verlet history after each
    // frame so the normal gravity solver cannot add extra equal oscillations
    // when the drop animation hands control back to it.
    if (wasIntroActive) {
      for (let i = 0; i < this.nodes.length; i += 1) this.previousNodes[i].copy(this.nodes[i]);
    }
  }

  updateRibbon() {
    for (let i = 0; i < this.nodes.length; i += 1) this.curvePoints[i].set(this.nodes[i].x, this.nodes[i].y, 0.7);
    const curve = new THREE.CatmullRomCurve3(this.curvePoints, false, 'chordal', 0.45);
    const points = curve.getSpacedPoints(41);
    const position = this.ribbonGeometry.attributes.position;
    const uv = this.ribbonGeometry.attributes.uv;
    let distanceAlong = 0;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const previous = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      const tangent = next.clone().sub(previous).normalize();
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize().multiplyScalar(this.strapWidth / 2);
      if (i > 0) distanceAlong += point.distanceTo(previous);
      position.setXYZ(i * 4, point.x - normal.x, point.y - normal.y, 0.9);
      position.setXYZ(i * 4 + 1, point.x + normal.x, point.y + normal.y, 0.9);
      position.setXYZ(i * 4 + 2, point.x + normal.x, point.y + normal.y, 0.1);
      position.setXYZ(i * 4 + 3, point.x - normal.x, point.y - normal.y, 0.1);
      const repeat = distanceAlong / 42;
      uv.setXY(i * 4, 0, repeat);
      uv.setXY(i * 4 + 1, 1, repeat);
      uv.setXY(i * 4 + 2, 1, repeat);
      uv.setXY(i * 4 + 3, 0, repeat);
    }
    position.needsUpdate = true;
    uv.needsUpdate = true;
    this.ribbonGeometry.computeVertexNormals();
  }

  updateVisuals(delta) {
    const end = this.nodes[this.nodes.length - 1];
    const center = this.cardCenterFromEnd(end);
    const prior = this.nodes[this.nodes.length - 2];
    const tangentX = end.x - prior.x;
    const tangentY = end.y - prior.y;
    const directionInfluence = clamp(tangentX / Math.max(1, Math.abs(tangentY)), -0.36, 0.36);
    const velocityInfluence = clamp((end.x - this.previousNodes[this.previousNodes.length - 1].x) * -0.012, -0.26, 0.26);
    const targetRotation = clamp(directionInfluence + velocityInfluence, -0.32, 0.32);
    this.card.rotation.z += (targetRotation - this.card.rotation.z) * Math.min(1, Math.max(0.14, delta * 9));
    this.card.position.set(center.x, center.y, 1.2);
    this.anchorHardware.position.set(this.anchor.x, this.anchor.y, 1.08);
    this.claspHardware.position.set(end.x, end.y, 1.3);
    this.claspHardware.rotation.z = Math.atan2(tangentX, -tangentY);
    this.updateRibbon();
  }

  tick(time) {
    this.frame = 0;
    if (!this.opened) return;
    const delta = Math.min(0.032, Math.max(0.001, (time - this.lastTime) / 1000));
    this.lastTime = time;
    this.updatePhysics(delta);
    this.updateVisuals(delta);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  destroy() {
    this.close();
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.card.geometry.dispose();
    this.cardMaterial.map?.dispose();
    this.cardMaterial.dispose();
    this.ribbonGeometry.dispose();
    this.ribbon.material.dispose();
    this.wovenTexture.dispose();
    this.hardwareMaterial.dispose();
    this.hardwareAccentMaterial.dispose();
    this.renderer.dispose();
  }
}
