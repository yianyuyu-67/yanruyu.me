import startupContent from "./startupContent";

const DRAG_THRESHOLD = 6;
const DROP_FEEDBACK_MS = 220;
const DESKTOP_HORIZONTAL_SPILL = 0.18;
const LAYOUT_STORAGE_KEY = "box:layout";
const LAYOUT_VERSION = 1;

export default class StartupExperience {
  constructor(root) {
    this.root = root;
    this.layout = root.querySelector(".stall-layout");
    this.resetButton = root.querySelector(".reset-layout");
    this.closeButton = root.querySelector(".stall-exit");
    this.contentOverlay = document.querySelector("[data-content-overlay]");
    this.contentPanel = document.querySelector(".content-panel");
    this.contentKicker = document.querySelector("#content-panel-kicker");
    this.contentTitle = document.querySelector("#content-panel-title");
    this.contentBody = document.querySelector("#content-panel-body");
    this.contentCloseButtons = [...document.querySelectorAll("[data-close-content]")];
    this.galleryOverlay = document.querySelector("[data-gallery-overlay]");
    this.galleryPanel = document.querySelector(".gallery-panel");
    this.galleryCloseButtons = [...document.querySelectorAll("[data-close-gallery]")];
    this.driftWall = document.querySelector("[data-drift-wall]");
    this.galleryAnimationFrame = null;
    this.galleryColumns = [];
    this.galleryLastFrameTime = 0;
    this.draggables = [...root.querySelectorAll("[data-draggable]")];
    this.layoutIds = this.draggables.map((item, index) => item.dataset.layoutId || `item-${index}`);
    this.abortController = new AbortController();
    this.isOpen = !root.hidden;
    this.activeDrag = null;
    this.layer = 10;
    this.mounted = false;
    this.lastFocusedItem = null;
    this.parentMessageHandler = (event) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      if (event.data?.type === "startup-stall-open") this.open({ origin: event.data.origin });
      if (event.data?.type === "startup-stall-close") this.close({ notify: false });
    };
  }

  mount() {
    if (this.mounted) return this;
    const options = { signal: this.abortController.signal };

    this.draggables.forEach((item) => {
      item.draggable = false;
      item.addEventListener("dragstart", (event) => event.preventDefault(), options);
      item.addEventListener("pointerdown", (event) => this.startDrag(event, item), options);
      item.addEventListener("pointermove", (event) => this.moveDrag(event), options);
      item.addEventListener("pointerup", (event) => this.endDrag(event), options);
      item.addEventListener("pointercancel", (event) => this.endDrag(event), options);
      item.addEventListener("lostpointercapture", (event) => this.endDrag(event), options);
      item.addEventListener("click", (event) => this.handleItemClick(event, item), options);
      item.addEventListener("keydown", (event) => {
        if (item.dataset.entry && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          this.openContent(item.dataset.entry);
        }
      }, options);
    });

    this.resetButton.addEventListener("click", () => this.resetLayout(), options);
    this.closeButton?.addEventListener("click", () => this.close(), options);
    this.contentCloseButtons.forEach((button) => {
      button.addEventListener("click", () => this.closeContent(), options);
    });
    this.contentBody.addEventListener("click", (event) => {
      if (event.target.closest("[data-open-gallery]")) this.openGallery();
    }, options);
    this.galleryCloseButtons.forEach((button) => {
      button.addEventListener("click", () => this.closeGallery(), options);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!this.galleryOverlay.hidden) this.closeGallery();
      else if (!this.contentOverlay.hidden) this.closeContent();
      else if (this.isOpen) this.close();
    }, options);
    window.addEventListener("message", this.parentMessageHandler, options);

    this.restoreLayout();

    this.mounted = true;
    return this;
  }

  destroy() {
    this.abortController.abort();
    this.mounted = false;
  }

  open({ origin } = {}) {
    this.root.hidden = false;
    this.isOpen = true;
    if (origin) this.root.style.setProperty("--startup-origin", `${origin.x}px ${origin.y}px`);
  }

  close({ notify = true } = {}) {
    this.closeContent();
    this.root.hidden = true;
    this.isOpen = false;
    if (notify) this.notifyParent({ type: "startup-stall-close", reason: "user" });
  }

  notifyParent(message) {
    if (window.parent !== window) {
      window.parent.postMessage(message, window.location.origin);
    }
  }

  openContent(entryKey) {
    const content = startupContent[entryKey];
    if (!content) return;

    this.lastFocusedItem = document.activeElement;
    this.contentKicker.textContent = content.kicker;
    this.contentTitle.textContent = content.title;
    this.contentBody.innerHTML = this.renderContent(entryKey, content);
    this.contentOverlay.hidden = false;
    this.contentPanel.focus({ preventScroll: true });
    this.root.classList.add("has-content-panel");
    if (entryKey === "henna" && content.gallery?.length) {
      this.renderGallery(content.gallery, this.contentBody.querySelector("[data-inline-drift-wall]"));
    }
  }

  openGallery() {
    const content = startupContent.henna;
    if (!this.galleryOverlay || !content?.gallery?.length) return;
    this.closeContent();
    this.renderGallery(content.gallery);
    this.galleryOverlay.hidden = false;
    this.galleryPanel?.focus({ preventScroll: true });
  }

  closeGallery() {
    if (!this.galleryOverlay || this.galleryOverlay.hidden) return;
    this.galleryOverlay.hidden = true;
    if (this.galleryAnimationFrame) cancelAnimationFrame(this.galleryAnimationFrame);
    this.galleryAnimationFrame = null;
    this.galleryColumns = [];
    this.galleryLastFrameTime = 0;
  }

  renderGallery(images, target = this.driftWall) {
    if (!target) return;
    if (this.galleryAnimationFrame) cancelAnimationFrame(this.galleryAnimationFrame);
    const columns = 4;
    const groups = Array.from({ length: columns }, () => []);
    images.forEach((src, index) => groups[index % columns].push(src));
    target.innerHTML = groups.map((group, columnIndex) => `
      <div class="drift-column${columnIndex % 2 ? " drift-column-reverse" : ""}" data-drift-column>
        <div class="drift-track">${group.concat(group).map((src, index) => `<figure class="drift-card" style="--card-tilt:${((index * 7 + columnIndex * 3) % 9) - 4}deg"><img src="${src}" alt="海娜纹身作品 ${columnIndex + 1}-${(index % group.length) + 1}" loading="lazy" /></figure>`).join("")}</div>
      </div>`).join("");
    const columnsForAnimation = [...target.querySelectorAll("[data-drift-column]")];
    if (target === this.driftWall) this.galleryColumns = columnsForAnimation;
    columnsForAnimation.forEach((column) => {
      column.addEventListener("pointerenter", () => column.classList.add("is-paused"), { signal: this.abortController.signal });
      column.addEventListener("pointerleave", () => column.classList.remove("is-paused"), { signal: this.abortController.signal });
    });
  }

  animateGallery(frameTime = performance.now()) {
    if (!this.galleryOverlay || this.galleryOverlay.hidden || !this.galleryColumns.length) return;
    const delta = Math.min(40, frameTime - (this.galleryLastFrameTime || frameTime));
    this.galleryLastFrameTime = frameTime;
    this.galleryColumns.forEach((column, index) => {
      if (column.classList.contains("is-paused")) return;
      const speed = index % 2 ? -0.021 : 0.021;
      const current = Number(column.dataset.driftOffset || 0) + speed * delta;
      const limit = column.scrollHeight / 2 || 1;
      const offset = ((current % limit) + limit) % limit;
      column.dataset.driftOffset = String(offset);
      column.querySelector(".drift-track").style.transform = `translate3d(0, ${index % 2 ? -offset : offset}px, 0)`;
    });
    this.galleryAnimationFrame = requestAnimationFrame((nextFrameTime) => this.animateGallery(nextFrameTime));
  }

  closeContent() {
    if (this.contentOverlay.hidden) return;
    this.contentOverlay.hidden = true;
    this.root.classList.remove("has-content-panel");
    if (this.lastFocusedItem && typeof this.lastFocusedItem.focus === "function") {
      this.lastFocusedItem.focus({ preventScroll: true });
    }
    this.lastFocusedItem = null;
  }

  renderContent(entryKey, content) {
    if (entryKey === "henna") {
      const works = content.works.length
        ? `<div class="work-grid">${content.works.map((work) => `<figure class="work-item"><img src="${work.src}" alt="${work.alt || ""}" /><figcaption>${work.caption || ""}</figcaption></figure>`).join("")}</div>`
        : `<div class="works-empty works-gallery-frame"><div class="drift-wall drift-wall-inline" data-inline-drift-wall aria-label="海娜纹身作品漂移照片墙"></div></div>`;

      return `
        <div class="content-intro content-section">
          <h3>${content.introTitle}</h3>
          <p>${content.intro}</p>
        </div>
        <div class="content-stall content-section">
          <h3>${content.stallTitle}</h3>
          <p>${content.stallCopy}</p>
          <div class="stat-grid">${content.stats.map((stat) => `<div class="stat-card"><strong>${stat.value}</strong><span>${stat.label}</span></div>`).join("")}</div>
        </div>
        <div class="content-works content-section">
          <div class="section-heading"><h3>${content.worksTitle}</h3><span>REAL WORKS</span></div>
          ${works}
        </div>`;
    }

    return `
      <ol class="case-step-list">${content.steps.map((step) => `<li><span class="case-step-number">${step.number}</span><div><h3>${step.title}</h3><p>${step.copy}</p></div></li>`).join("")}</ol>
      <p class="case-conclusion">${content.conclusion}</p>`;
  }

  resetLayout() {
    try {
      window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
    } catch {
      // Keep the visual reset available when storage is unavailable.
    }
    this.draggables.forEach((item) => {
      item.style.removeProperty("left");
      item.style.removeProperty("top");
      item.style.removeProperty("right");
      item.style.removeProperty("z-index");
      item.classList.remove("is-dragging", "was-dropped", "is-flipped", "is-revealed");
      item.setAttribute("aria-pressed", "false");
      item.setAttribute("aria-expanded", "false");
    });
    this.layer = 10;
    const detail = { version: LAYOUT_VERSION, items: null };
    window.dispatchEvent(new CustomEvent(LAYOUT_STORAGE_KEY, { detail }));
    this.notifyParent({ type: LAYOUT_STORAGE_KEY, layout: detail });
  }

  restoreLayout() {
    let saved = null;
    let hasStoredLayout = false;
    try {
      const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      hasStoredLayout = raw !== null;
      saved = JSON.parse(raw || "null");
    } catch {
      saved = null;
      hasStoredLayout = true;
    }

    const keys = new Set(this.layoutIds);
    const savedItems = saved?.version === LAYOUT_VERSION && saved?.items && typeof saved.items === "object"
      ? saved.items
      : null;
    const valid = savedItems
      && Object.keys(savedItems).length === keys.size
      && this.layoutIds.every((id) => {
        const position = savedItems[id];
        return position
          && Number.isFinite(position.left)
          && Number.isFinite(position.top)
          && position.left >= -0.35 && position.left <= 1.35
          && position.top >= 0 && position.top <= 1;
      });

    if (!valid) {
      if (hasStoredLayout) {
        try {
          window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
        } catch {
          // Ignore storage cleanup failures; defaults are still applied.
        }
      }
      return;
    }

    this.draggables.forEach((item, index) => {
      const position = savedItems[this.layoutIds[index]];
      item.style.left = `${position.left * 100}%`;
      item.style.top = `${position.top * 100}%`;
      item.style.right = "auto";
    });
  }

  persistLayout() {
    const width = this.layout.clientWidth;
    const height = this.layout.clientHeight;
    if (!width || !height) return;

    const items = {};
    this.draggables.forEach((item, index) => {
      const left = item.style.left ? parseFloat(item.style.left) / 100 : item.offsetLeft / width;
      const top = item.style.top ? parseFloat(item.style.top) / 100 : item.offsetTop / height;
      if (Number.isFinite(left) && Number.isFinite(top)) {
        items[this.layoutIds[index]] = { left, top };
      }
    });

    if (Object.keys(items).length !== this.draggables.length) return;
    const detail = { version: LAYOUT_VERSION, items };
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(detail));
    } catch {
      return;
    }
    window.dispatchEvent(new CustomEvent(LAYOUT_STORAGE_KEY, { detail }));
    this.notifyParent({ type: LAYOUT_STORAGE_KEY, layout: detail });
  }

  startDrag(event, item) {
    if (event.button !== undefined && event.button !== 0) return;
    if (this.activeDrag) return;

    const layoutRect = this.layout.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const startLeft = item.offsetLeft;
    const startTop = item.offsetTop;

    this.activeDrag = {
      item,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft,
      startTop,
      width: itemRect.width,
      height: itemRect.height,
      visualOffsetX: itemRect.left - layoutRect.left - startLeft,
      visualOffsetY: itemRect.top - layoutRect.top - startTop,
      dragged: false,
    };

    item.setPointerCapture(event.pointerId);
  }

  moveDrag(event) {
    const drag = this.activeDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.dragged && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    if (!drag.dragged) {
      drag.dragged = true;
      drag.item.classList.add("is-dragging");
      drag.item.style.zIndex = String(++this.layer);
    }

    event.preventDefault();
    const minLeft = -drag.visualOffsetX;
    const minTop = -drag.visualOffsetY;
    const horizontalSpill = window.matchMedia("(max-width: 720px)").matches
      ? 0
      : this.layout.clientWidth * DESKTOP_HORIZONTAL_SPILL;
    const minHorizontal = minLeft - horizontalSpill;
    const maxLeft = this.layout.clientWidth - drag.visualOffsetX - drag.width + horizontalSpill;
    const maxTop = this.layout.clientHeight - drag.visualOffsetY - drag.height;
    const nextLeft = Math.min(maxLeft, Math.max(minHorizontal, drag.startLeft + deltaX));
    const nextTop = Math.min(maxTop, Math.max(minTop, drag.startTop + deltaY));

    drag.item.style.left = `${(nextLeft / this.layout.clientWidth) * 100}%`;
    drag.item.style.top = `${(nextTop / this.layout.clientHeight) * 100}%`;
    drag.item.style.right = "auto";
  }

  endDrag(event) {
    const drag = this.activeDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    this.activeDrag = null;
    drag.item.classList.remove("is-dragging");
    if (drag.item.hasPointerCapture(event.pointerId)) drag.item.releasePointerCapture(event.pointerId);
    if (!drag.dragged) return;

    this.persistLayout();
    drag.item.dataset.suppressClick = "true";
    drag.item.classList.add("was-dropped");
    window.setTimeout(() => {
      delete drag.item.dataset.suppressClick;
      drag.item.classList.remove("was-dropped");
    }, DROP_FEEDBACK_MS);
  }

  handleItemClick(event, item) {
    if (item.dataset.suppressClick === "true") {
      event.preventDefault();
      return;
    }
    if (item.dataset.entry) {
      this.openContent(item.dataset.entry);
      return;
    }
    if (item.hasAttribute("data-flip")) {
      const flipped = item.classList.toggle("is-flipped");
      item.setAttribute("aria-pressed", String(flipped));
    }
    if (item.hasAttribute("data-money")) {
      const revealed = item.classList.toggle("is-revealed");
      item.setAttribute("aria-expanded", String(revealed));
    }
  }
}
