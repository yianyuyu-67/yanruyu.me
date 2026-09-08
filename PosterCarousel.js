import { gsap } from 'gsap';

const posterImages = [
  'poster-01.jpg','poster-03.jpg','poster-08.jpg','poster-15.jpg','poster-02.jpg','poster-05.jpg','poster-10.png','poster-06.png','poster-11.jpg','poster-12.png','poster-07.png','poster-04.jpg','poster-13.png','poster-14.png'
].map(name => `./assets/posters/${name}`);

const fallbackPalettes = [
  ['#d27d55','#f0c49a'],['#e2a449','#f7d79a'],['#5477a8','#b8d0e6'],['#bd5347','#edb280'],
  ['#6c7e9f','#cbd8e5'],['#df8752','#f4d2a3'],['#4c8a86','#acd4c6'],['#bc674f','#f0c29f'],
  ['#8c5d73','#d6a5b8'],['#d15e4d','#f1b27f'],['#8b6b49','#dfc08f'],['#4e6e9e','#afc6e8'],
  ['#6c8871','#c0d7bc'],['#d19a43','#f4d7a0']
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;

export class PosterCarousel {
  constructor({ overlay, stage, cardsRoot, bgCanvas, closeButton, backButton, reducedMotion = false, onClose } = {}) {
    this.overlay = overlay; this.stage = stage; this.cardsRoot = cardsRoot; this.bgCanvas = bgCanvas;
    this.bgCtx = bgCanvas?.getContext('2d'); this.closeButton = closeButton; this.backButton = backButton;
    this.reducedMotion = reducedMotion; this.onClose = onClose; this.items = []; this.positions = []; this.track = 0; this.step = 0;
    this.scrollX = 0; this.velocity = 0; this.raf = 0; this.lastTime = 0; this.dragging = false;
    this.lastX = 0; this.lastT = 0; this.lastDelta = 0; this.activeIndex = -1;
    this.palette = fallbackPalettes.map(([a,b]) => ({a,b})); this.paletteCurrent = { a:fallbackPalettes[0][0], b:fallbackPalettes[0][1] }; this.lastBgDraw=0; this.bgFastUntil=0;
    this.boundResize = () => this.resize(); this.boundKey = event => this.onKey(event);
    this.boundWheel = event => this.onWheel(event); this.boundDown = event => this.onPointerDown(event);
    this.boundMove = event => this.onPointerMove(event); this.boundUp = event => this.onPointerUp(event);
  }

  mount() {
    this.cardsRoot.innerHTML = '';
    posterImages.forEach((src, index) => {
      const card = document.createElement('article'); card.className = 'poster-card'; card.dataset.index = String(index);
      const image = new Image(); image.className = 'poster-card__image'; image.src = src; image.alt = `海报作品 ${index + 1}`; image.loading = index < 5 ? 'eager' : 'lazy'; image.draggable = false;
      card.appendChild(image); this.cardsRoot.appendChild(card); this.items.push({ el:card, x:index * 1 });
      image.addEventListener('load', () => { this.extractPalette(image, index); this.scheduleResize(); }, { once:true });
    });
    this.resize();
    this.stage.addEventListener('wheel', this.boundWheel, { passive:false });
    this.stage.addEventListener('pointerdown', this.boundDown);
    this.stage.addEventListener('pointermove', this.boundMove);
    this.stage.addEventListener('pointerup', this.boundUp);
    this.stage.addEventListener('pointercancel', this.boundUp);
    window.addEventListener('resize', this.boundResize);
    document.addEventListener('keydown', this.boundKey);
  }

  resize() {
    const sample = this.items[0]?.el; if (!sample) return;
    // Keep every poster at the same height while preserving its native aspect ratio.
    const cardHeight = Math.max(280, Math.min(innerHeight * .78, 680));
    // Reference carousel spacing. This is the edge-to-edge gap between cards.
    const gap = 28;
    const previousTrack = this.track || 1;
    const ratio = this.scrollX / previousTrack;
    let cursor = 0;
    let previousWidth = 0;
    let totalWidth = 0;
    this.items.forEach((item, index) => {
      const image = item.el.querySelector('img');
      const imageRatio = image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : 210 / 297;
      const width = Math.max(150, Math.min(cardHeight * imageRatio, innerWidth * .58));
      item.el.style.height = `${cardHeight}px`;
      item.el.style.width = `${width}px`;
      item.x = index === 0 ? 0 : cursor + previousWidth / 2 + gap + width / 2;
      cursor = item.x;
      previousWidth = width;
      totalWidth += width + gap;
    });
    this.track = Math.max(totalWidth, 1);
    this.scrollX = mod(ratio * this.track, this.track); this.positions = new Float32Array(this.items.length); this.resizeCanvas(); this.update();
  }

  scheduleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.resize(), 90);
  }

  resizeCanvas() { if (!this.bgCanvas || !this.bgCtx) return; const dpr = Math.min(devicePixelRatio || 1, 2); this.bgCanvas.width = innerWidth * dpr; this.bgCanvas.height = innerHeight * dpr; this.bgCanvas.style.width = '100%'; this.bgCanvas.style.height = '100%'; this.bgCtx.setTransform(dpr,0,0,dpr,0,0); }

  extractPalette(image, index) {
    try {
      if (!image.naturalWidth) return;
      const canvas = document.createElement('canvas'); canvas.width = 20; canvas.height = 20; const ctx = canvas.getContext('2d'); ctx.drawImage(image,0,0,20,20);
      const data = ctx.getImageData(0,0,20,20).data; let r=0,g=0,b=0,count=0;
      for(let i=0;i<data.length;i+=4){ if(data[i+3]<20) continue; r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++; }
      if(!count) return; const base=`rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`;
      this.palette[index] = { a:base, b:'#f6eee5' }; if(index===this.activeIndex) this.setGradient(index);
    } catch { /* local images can still use the fallback palette */ }
  }

  open() {
    this.overlay.classList.add('show'); this.overlay.setAttribute('aria-hidden','false'); this.overlay.style.opacity='0';
    gsap.killTweensOf(this.overlay); gsap.to(this.overlay,{ opacity:1, duration:this.reducedMotion?.01:.42, ease:'power2.out' });
    this.resize(); this.start();
  }

  close() {
    gsap.killTweensOf(this.overlay); gsap.to(this.overlay,{ opacity:0, duration:this.reducedMotion?.01:.24, ease:'power2.in', onComplete:()=>{ this.overlay.classList.remove('show'); this.overlay.setAttribute('aria-hidden','true'); this.stop(); } });
  }

  start() { if(this.raf) return; this.lastTime=0; this.raf=requestAnimationFrame(time=>this.tick(time)); }
  stop() { if(this.raf) cancelAnimationFrame(this.raf); this.raf=0; this.velocity=0; }
  tick(time) { const dt=this.lastTime ? Math.min(.05,(time-this.lastTime)/1000) : 0; this.lastTime=time; this.scrollX=mod(this.scrollX+this.velocity*dt,this.track||1); this.velocity*=Math.pow(.9,dt*60); if(Math.abs(this.velocity)<.02)this.velocity=0; this.update(); this.raf=requestAnimationFrame(next=>this.tick(next)); }

  update() {
    if(!this.track || !this.items.length) return; const half=this.track/2; let closest=-1, distance=Infinity; const viewportHalf=innerWidth*.5;
    this.items.forEach((item,index)=>{ let position=item.x-this.scrollX; if(position<-half)position+=this.track; if(position>half)position-=this.track; this.positions[index]=position; const d=Math.abs(position); if(d<distance){distance=d;closest=index;} });
    this.items.forEach((item,index)=>{ const x=this.positions[index]; const norm=clamp(x/viewportHalf,-1,1); const inverse=1-Math.abs(norm); const rotate=-norm*28; const depth=inverse*140; const scale=.92+inverse*.1; item.el.style.transform=`translate3d(${x}px, -50%, ${depth}px) rotateY(${rotate}deg) scale(${scale})`; item.el.style.zIndex=String(1000+Math.round(depth)); const core=index===closest || index===(closest-1+this.items.length)%this.items.length || index===(closest+1)%this.items.length; item.el.style.filter=core?'none':`blur(${(2*Math.pow(Math.abs(norm),1.1)).toFixed(2)}px)`; });
    if(closest!==this.activeIndex){this.activeIndex=closest;this.setGradient(closest);}
    this.drawBackground();
  }

  setGradient(index){ const next=this.palette[index]||this.palette[0]; this.bgFastUntil=performance.now()+800; gsap.to(this.paletteCurrent,{a:next.a,b:next.b,duration:this.reducedMotion?.01:.45,ease:'power2.out'}); }
  drawBackground(){
    if(!this.bgCtx)return;
    const now=performance.now(); const minInterval=now<this.bgFastUntil?16:33;
    if(now-this.lastBgDraw<minInterval)return; this.lastBgDraw=now;
    const w=innerWidth,h=innerHeight; this.bgCtx.clearRect(0,0,w,h);
    // Reference background: light base, a moving color field in the upper
    // right, and two soft black Gaussian regions along the right and bottom.
    this.bgCtx.fillStyle='#f7f4f1'; this.bgCtx.fillRect(0,0,w,h);
    const time=now*.0002;
    const colorX=w*(.5+Math.cos(time)*.06); const colorY=h*(.42+Math.sin(time*.8)*.04);
    const colorField=this.bgCtx.createRadialGradient(colorX,colorY,0,colorX,colorY,Math.max(w,h)*.70);
    colorField.addColorStop(0,this.paletteCurrent.a); colorField.addColorStop(.48,this.paletteCurrent.b); colorField.addColorStop(.78,'rgba(247,244,241,.2)'); colorField.addColorStop(1,'rgba(255,255,255,0)');
    this.bgCtx.fillStyle=colorField; this.bgCtx.fillRect(0,0,w,h);
    // A restrained second pass deepens the center without darkening the base.
    const colorCore=this.bgCtx.createRadialGradient(colorX,colorY,0,colorX,colorY,Math.max(w,h)*.42);
    colorCore.addColorStop(0,this.paletteCurrent.a); colorCore.addColorStop(.62,this.paletteCurrent.b); colorCore.addColorStop(1,'rgba(247,244,241,0)');
    this.bgCtx.globalAlpha=.24; this.bgCtx.fillStyle=colorCore; this.bgCtx.fillRect(0,0,w,h); this.bgCtx.globalAlpha=1;
  }

  onWheel(event){ event.preventDefault(); const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY; this.velocity=clamp(this.velocity+delta*.6*20,-2600,2600); }
  onPointerDown(event){ if(event.target.closest('button')) return; this.dragging=true; this.lastX=event.clientX; this.lastT=performance.now(); this.lastDelta=0; this.stage.setPointerCapture?.(event.pointerId); this.stage.classList.add('dragging'); }
  onPointerMove(event){ if(!this.dragging)return; const now=performance.now(); const dt=Math.max(1,now-this.lastT)/1000; const dx=event.clientX-this.lastX; this.scrollX=mod(this.scrollX-dx,this.track||1); this.lastDelta=dx/dt; this.lastX=event.clientX; this.lastT=now; }
  onPointerUp(event){ if(!this.dragging)return; this.dragging=false; this.stage.releasePointerCapture?.(event.pointerId); this.velocity=clamp(-this.lastDelta,-2600,2600); this.stage.classList.remove('dragging'); }
  onKey(event){ if(!this.overlay.classList.contains('show')) return; if(event.key==='Escape'){event.preventDefault(); if(this.onClose)this.onClose(); else this.close();} if(event.key==='ArrowRight'){this.velocity=clamp(this.velocity+220,-2600,2600);} if(event.key==='ArrowLeft'){this.velocity=clamp(this.velocity-220,-2600,2600);} }

  destroy(){ this.stop(); this.stage.removeEventListener('wheel',this.boundWheel); this.stage.removeEventListener('pointerdown',this.boundDown); this.stage.removeEventListener('pointermove',this.boundMove); this.stage.removeEventListener('pointerup',this.boundUp); this.stage.removeEventListener('pointercancel',this.boundUp); window.removeEventListener('resize',this.boundResize); document.removeEventListener('keydown',this.boundKey); }
}

export { posterImages };
