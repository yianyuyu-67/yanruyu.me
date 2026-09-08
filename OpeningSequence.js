(() => {
  const root = document.querySelector('#openingSequence');
  const enterButton = document.querySelector('#openingEnter');
  const progressBar = document.querySelector('#openingProgress');
  const status = document.querySelector('#openingStatus');
  const particleHost = document.querySelector('#openingParticleText');
  const particleCanvas = document.querySelector('#openingParticleCanvas');
  if (!root || !enterButton || !progressBar || !status) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('intro') === '0' || params.has('dev')) {
    root.hidden = true;
    document.body.classList.remove('opening-active');
    return;
  }

  class ParticleText {
    constructor(host, canvas, text) {
      this.host = host;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.text = text;
      this.particles = [];
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.frame = 0;
      this.startedAt = performance.now();
      this.exiting = false;
      this.exitStartedAt = 0;
      this.pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0, active: false };
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.motionQuery.matches;
      this.handleMotionChange = (event) => {
        this.reducedMotion = event.matches;
        this.buildParticles();
      };
      this.motionQuery.addEventListener?.('change', this.handleMotionChange);
      this.bindPointer();
      this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
      this.resizeObserver?.observe(this.host);
      this.resize();
      this.render = this.render.bind(this);
      this.frame = requestAnimationFrame(this.render);
    }

    bindPointer() {
      this.toLocal = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = event.clientX - rect.left;
        this.pointer.y = event.clientY - rect.top;
        this.pointer.active = true;
      };
      this.onPointerMove = (event) => this.toLocal(event);
      this.onPointerEnter = (event) => this.toLocal(event);
      this.onPointerLeave = () => { this.pointer.active = false; };
      this.canvas.addEventListener('pointerenter', this.onPointerEnter, { passive: true });
      this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
      this.canvas.addEventListener('pointercancel', this.onPointerLeave, { passive: true });
    }

    resize() {
      const rect = this.host.getBoundingClientRect();
      const width = Math.max(180, Math.round(rect.width));
      const height = Math.max(82, Math.round(rect.height));
      if (width === this.width && height === this.height && this.particles.length) return;
      this.width = width;
      this.height = height;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(width * this.dpr);
      this.canvas.height = Math.round(height * this.dpr);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.buildParticles();
    }

    buildParticles() {
      if (!this.ctx || !this.width || !this.height) return;
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      const density = this.reducedMotion ? 6 : (mobile ? 5 : 3.5);
      const maxParticles = this.reducedMotion ? 1400 : (mobile ? 2300 : 4200);
      const sample = document.createElement('canvas');
      sample.width = Math.max(1, Math.round(this.width * this.dpr));
      sample.height = Math.max(1, Math.round(this.height * this.dpr));
      const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
      if (!sampleCtx) return;

      let fontSize = Math.min(mobile ? 58 : 190, this.height * (mobile ? .7 : .9));
      sampleCtx.font = `650 ${fontSize * this.dpr}px Inter, system-ui, sans-serif`;
      const maxTextWidth = sample.width * (mobile ? .96 : .97);
      const measured = sampleCtx.measureText(this.text).width;
      if (measured > maxTextWidth) {
        fontSize *= maxTextWidth / measured;
        sampleCtx.font = `650 ${fontSize * this.dpr}px Inter, system-ui, sans-serif`;
      }
      sampleCtx.clearRect(0, 0, sample.width, sample.height);
      sampleCtx.fillStyle = '#fff';
      sampleCtx.textAlign = 'center';
      sampleCtx.textBaseline = 'middle';
      sampleCtx.fillText(this.text, sample.width / 2, sample.height / 2);
      const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
      const step = Math.max(2, Math.round(density * this.dpr));
      const targets = [];
      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          if (pixels[(y * sample.width + x) * 4 + 3] > 100) targets.push({ x: x / this.dpr, y: y / this.dpr });
        }
      }
      if (targets.length > maxParticles) {
        const stride = targets.length / maxParticles;
        const reduced = [];
        for (let i = 0; i < maxParticles; i += 1) reduced.push(targets[Math.floor(i * stride)]);
        targets.splice(0, targets.length, ...reduced);
      }

      const scatter = this.reducedMotion ? 0 : Math.min(180, Math.max(90, this.width * .23));
      const size = mobile ? 1.15 : 1.45;
      this.particles = targets.map((target, index) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * scatter;
        return {
          targetX: target.x,
          targetY: target.y,
          x: this.reducedMotion ? target.x : target.x + Math.cos(angle) * distance,
          y: this.reducedMotion ? target.y : target.y + Math.sin(angle) * distance,
          delay: this.reducedMotion ? 0 : (index / Math.max(1, targets.length)) * 420 + Math.random() * 80,
          size,
          phase: Math.random() * Math.PI * 2,
        };
      });
      this.startedAt = performance.now();
    }

    render(now) {
      const ctx = this.ctx;
      const elapsed = now - this.startedAt;
      const exitProgress = this.exiting ? Math.min(1, (now - this.exitStartedAt) / 720) : 0;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();
      ctx.scale(this.dpr, this.dpr);
      const pointerEase = this.reducedMotion ? 1 : .18;
      this.pointer.smoothX += (this.pointer.x - this.pointer.smoothX) * pointerEase;
      this.pointer.smoothY += (this.pointer.y - this.pointer.smoothY) * pointerEase;
      const repelRadius = this.reducedMotion ? 0 : 116;
      const gatherDuration = this.reducedMotion ? 1 : 1500;
      for (const particle of this.particles) {
        const gather = Math.min(1, Math.max(0, (elapsed - particle.delay) / gatherDuration));
        const eased = 1 - Math.pow(1 - gather, 3);
        let baseX = particle.x + (particle.targetX - particle.x) * eased;
        let baseY = particle.y + (particle.targetY - particle.y) * eased;
        if (!this.reducedMotion && gather > .8 && !this.exiting) {
          baseX += Math.sin(now * .0012 + particle.phase) * .45;
          baseY += Math.cos(now * .001 + particle.phase) * .35;
        }
        if (this.pointer.active && repelRadius && gather > .75 && !this.exiting) {
          const dx = baseX - this.pointer.smoothX;
          const dy = baseY - this.pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * 42;
            baseX += (dx / distance) * force;
            baseY += (dy / distance) * force;
          }
        }
        if (this.exiting) {
          const dx = baseX - this.width / 2;
          const dy = baseY - this.height / 2;
          const distance = Math.max(1, Math.hypot(dx, dy));
          baseX += (dx / distance) * exitProgress * 38;
          baseY += (dy / distance) * exitProgress * 38;
        }
        const goldMix = this.pointer.active && !this.exiting && repelRadius
          ? Math.max(0, 1 - Math.hypot(baseX - this.pointer.smoothX, baseY - this.pointer.smoothY) / repelRadius)
          : 0;
        const r = Math.round(238 + (207 - 238) * goldMix);
        const g = Math.round(232 + (183 - 232) * goldMix);
        const b = Math.round(215 + (121 - 215) * goldMix);
        ctx.globalAlpha = (this.reducedMotion ? 1 : .96) * (1 - exitProgress);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(baseX - particle.size / 2, baseY - particle.size / 2, particle.size, particle.size);
      }
      ctx.restore();
      this.frame = requestAnimationFrame(this.render);
    }

    exit() {
      if (this.exiting) return;
      this.exiting = true;
      this.exitStartedAt = performance.now();
    }

    destroy() {
      cancelAnimationFrame(this.frame);
      this.resizeObserver?.disconnect();
      this.motionQuery.removeEventListener?.('change', this.handleMotionChange);
      this.canvas.removeEventListener('pointerenter', this.onPointerEnter);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
      this.canvas.removeEventListener('pointercancel', this.onPointerLeave);
    }
  }

  const particleText = particleHost && particleCanvas ? new ParticleText(particleHost, particleCanvas, 'Yu Detective Agency') : null;
  const startedAt = performance.now();
  const minimumDuration = 1450;
  let progress = 0;
  let ready = false;
  let progressTimer = 0;

  const setProgress = (value) => {
    progress = Math.max(progress, Math.min(100, value));
    progressBar.style.width = `${progress}%`;
  };

  const tickProgress = () => {
    if (ready) return;
    const remaining = 88 - progress;
    setProgress(progress + Math.max(.4, remaining * .075));
    progressTimer = window.setTimeout(tickProgress, 90 + Math.random() * 90);
  };

  const showEntry = () => {
    if (ready) return;
    ready = true;
    window.clearTimeout(progressTimer);
    setProgress(100);
    status.textContent = '卷宗已就绪';
    window.setTimeout(() => {
      root.classList.add('is-ready');
      enterButton.disabled = false;
      enterButton.focus({ preventScroll: true });
    }, 280);
  };

  const markLoaded = () => {
    const elapsed = performance.now() - startedAt;
    window.setTimeout(showEntry, Math.max(0, minimumDuration - elapsed));
  };

  const enter = () => {
    if (!ready || root.classList.contains('is-exiting')) return;
    root.classList.add('is-exiting');
    particleText?.exit();
    // Let the scene prepare its hidden camera pose while the doors still cover it.
    window.dispatchEvent(new CustomEvent('opening:scene-intro'));
    enterButton.disabled = true;
    window.setTimeout(() => {
      particleText?.destroy();
      root.hidden = true;
      document.body.classList.remove('opening-active');
      document.querySelector('#app canvas')?.focus?.({ preventScroll: true });
      window.dispatchEvent(new CustomEvent('opening:complete'));
    }, 1200);
  };

  enterButton.addEventListener('click', enter);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && ready && !root.hidden) enter();
  });

  tickProgress();
  if (document.readyState === 'complete') markLoaded();
  else window.addEventListener('load', markLoaded, { once: true });
  window.setTimeout(markLoaded, 8000);
})();
