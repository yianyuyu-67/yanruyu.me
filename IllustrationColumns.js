import { gsap } from 'gsap';

const illustrationImages = Array.from({ length: 19 }, (_, index) => `./assets/illustrations/illustration-${String(index + 1).padStart(2, '0')}.jpg`);

// Background preload: same strategy as PosterCarousel — staggered, low
// priority, started after the opening sequence so the gallery opens warm.
if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  illustrationImages.forEach((src, index) => {
    window.setTimeout(() => {
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = 'low';
      img.src = src;
    }, 3400 + index * 380);
  });
}

export class IllustrationColumns {
  constructor({ overlay, stage, columnsRoot, closeButton, reducedMotion = false, onClose } = {}) {
    this.overlay = overlay; this.stage = stage; this.columnsRoot = columnsRoot; this.closeButton = closeButton;
    this.reducedMotion = reducedMotion; this.onClose = onClose; this.raf = 0; this.scrollY = 0; this.targetY = 0; this.lastTime = 0;
    this.dragging = false; this.lastPointerY = 0; this.lastPointerTime = 0; this.velocity = 0;
    this.boundWheel = event => this.onWheel(event); this.boundDown = event => this.onPointerDown(event); this.boundMove = event => this.onPointerMove(event); this.boundUp = event => this.onPointerUp(event); this.boundResize = () => this.updateBounds(); this.boundKey = event => this.onKey(event);
  }
  mount() {
    this.columnsRoot.innerHTML = '';
    const groups = [[], [], []];
    illustrationImages.forEach((src, index) => groups[index % 3].push(src));
    groups.forEach((images, columnIndex) => {
      const column = document.createElement('div'); column.className = `illustration-column illustration-column--${columnIndex + 1}`;
      const track = document.createElement('div'); track.className = 'illustration-column__track';
      images.forEach((src, imageIndex) => { const figure = document.createElement('figure'); figure.className='illustration-item'; const image=new Image(); image.src=src; image.alt=`插画作品 ${columnIndex * 6 + imageIndex + 1}`; image.loading='lazy'; figure.appendChild(image); track.appendChild(figure); });
      track.addEventListener('click', event => { const figure = event.target.closest('.illustration-item'); const image = figure?.querySelector('img'); if(image) this.openViewer(image.src, image.alt); });
      // Duplicate each column so the parallax loop can wrap without exposing
      // an empty column when the user keeps scrolling.
      [...track.children].forEach(child => track.appendChild(child.cloneNode(true)));
      column.appendChild(track); this.columnsRoot.appendChild(column);
    });
    this.stage.addEventListener('wheel', this.boundWheel, { passive:false }); this.stage.addEventListener('pointerdown', this.boundDown); this.stage.addEventListener('pointermove', this.boundMove); this.stage.addEventListener('pointerup', this.boundUp); this.stage.addEventListener('pointercancel', this.boundUp); window.addEventListener('resize', this.boundResize); document.addEventListener('keydown', this.boundKey); this.updateBounds();
  }
  openViewer(src, alt) {
    if(this.viewer) return;
    const viewer=document.createElement('div'); viewer.className='illustration-viewer'; viewer.innerHTML=`<button type="button" class="illustration-viewer__close" aria-label="关闭图片">关闭</button><img src="${src}" alt="${alt}">`;
    viewer.addEventListener('click',event=>{if(event.target===viewer||event.target.closest('.illustration-viewer__close')){viewer.remove();this.viewer=null;}}); document.body.appendChild(viewer); this.viewer=viewer;
  }
  updateBounds() {
    this.columnMetrics = [...this.columnsRoot.children].map(column => {
      const track = column.querySelector('.illustration-column__track');
      const cycleHeight = track ? track.scrollHeight / 2 : innerHeight;
      return { column, cycleHeight: Math.max(cycleHeight, innerHeight * .8) };
    });
    this.limit = Math.max(innerHeight * 2.5, Math.max(...this.columnMetrics.map(metric => metric.cycleHeight), 0) * 4);
  }
  open() { this.overlay.classList.add('show'); this.overlay.setAttribute('aria-hidden','false'); this.overlay.style.opacity='0'; gsap.killTweensOf(this.overlay); gsap.to(this.overlay,{opacity:1,duration:this.reducedMotion?.01:.4,ease:'power2.out'}); this.updateBounds(); this.start(); }
  close() { gsap.killTweensOf(this.overlay); gsap.to(this.overlay,{opacity:0,duration:this.reducedMotion?.01:.22,ease:'power2.in',onComplete:()=>{this.overlay.classList.remove('show');this.overlay.setAttribute('aria-hidden','true');this.stop();if(this.onClose)this.onClose();}}); }
  start() { if(this.raf)return; this.lastTime=0; this.raf=requestAnimationFrame(t=>this.tick(t)); }
  stop() { if(this.raf)cancelAnimationFrame(this.raf); this.raf=0; this.velocity=0; }
  tick(time) { const dt=this.lastTime?Math.min(.05,(time-this.lastTime)/1000):0; this.lastTime=time; this.targetY+=this.velocity*dt; this.targetY=Math.max(-this.limit,Math.min(this.limit,this.targetY)); this.velocity*=Math.pow(.88,dt*60); this.scrollY+=(this.targetY-this.scrollY)*Math.min(1,dt*12); this.render(); this.raf=requestAnimationFrame(t=>this.tick(t)); }
  render() {
    if(!this.columnMetrics) return;
    this.columnMetrics.forEach(({ column, cycleHeight }, index) => {
      const direction=index===1?-1:1; const factor=index===1?.72:.96;
      const shift=this.scrollY * direction * factor;
      const wrapped=((shift % cycleHeight) + cycleHeight) % cycleHeight;
      column.style.transform=`translate3d(0, ${wrapped - cycleHeight}px, 0)`;
    });
  }
  onWheel(event) { event.preventDefault(); this.velocity=Math.max(-2600,Math.min(2600,this.velocity + event.deltaY * 1.15)); }
  onPointerDown(event) { if(event.target.closest('button'))return; this.dragging=true; this.lastPointerY=event.clientY; this.lastPointerTime=performance.now(); this.velocity=0; this.stage.setPointerCapture?.(event.pointerId); this.stage.classList.add('dragging'); }
  onPointerMove(event) { if(!this.dragging)return; const now=performance.now(); const dy=event.clientY-this.lastPointerY; const dt=Math.max(1,now-this.lastPointerTime)/1000; this.targetY-=dy; this.velocity=-dy/dt; this.lastPointerY=event.clientY; this.lastPointerTime=now; }
  onPointerUp(event) { if(!this.dragging)return; this.dragging=false; this.stage.releasePointerCapture?.(event.pointerId); this.velocity=Math.max(-2600,Math.min(2600,this.velocity)); this.stage.classList.remove('dragging'); }
  onKey(event) { if(!this.overlay.classList.contains('show'))return; if(event.key==='Escape'){event.preventDefault(); if(this.viewer){this.viewer.remove();this.viewer=null;} else this.close();} if(event.key==='ArrowDown')this.velocity=Math.min(2600,this.velocity+500); if(event.key==='ArrowUp')this.velocity=Math.max(-2600,this.velocity-500); }
  destroy() { this.stop(); this.stage.removeEventListener('wheel',this.boundWheel); this.stage.removeEventListener('pointerdown',this.boundDown); this.stage.removeEventListener('pointermove',this.boundMove); this.stage.removeEventListener('pointerup',this.boundUp); this.stage.removeEventListener('pointercancel',this.boundUp); window.removeEventListener('resize',this.boundResize); document.removeEventListener('keydown',this.boundKey); }
}

export { illustrationImages };
