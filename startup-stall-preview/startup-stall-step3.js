(() => {
  const DRAG_THRESHOLD = 6;
  const DROP_FEEDBACK_MS = 220;

  class StartupExperience {
    constructor(root) {
      this.root = root;
      this.layout = root.querySelector(".stall-layout");
      this.resetButton = root.querySelector(".reset-layout");
      this.contentOverlay = document.querySelector("[data-content-overlay]");
      this.contentPanel = document.querySelector(".content-panel");
      this.contentKicker = document.querySelector("#content-panel-kicker");
      this.contentTitle = document.querySelector("#content-panel-title");
      this.contentBody = document.querySelector("#content-panel-body");
      this.contentCloseButtons = [...document.querySelectorAll("[data-close-content]")];
      this.draggables = [...root.querySelectorAll("[data-draggable]")];
      this.isOpen = !root.hidden;
      this.activeDrag = null;
      this.layer = 10;
      this.mounted = false;
      this.lastFocusedItem = null;
    }

    mount() {
      if (this.mounted) return this;

      this.draggables.forEach((item) => {
        item.draggable = false;
        item.addEventListener("dragstart", (event) => event.preventDefault());
        item.addEventListener("pointerdown", (event) => this.startDrag(event, item));
        item.addEventListener("pointermove", (event) => this.moveDrag(event));
        item.addEventListener("pointerup", (event) => this.endDrag(event));
        item.addEventListener("pointercancel", (event) => this.endDrag(event));
        item.addEventListener("lostpointercapture", (event) => this.endDrag(event));
        item.addEventListener("click", (event) => this.handleItemClick(event, item));
        item.addEventListener("keydown", (event) => {
          if (item.dataset.entry && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            this.openContent(item.dataset.entry);
          }
        });
      });

      this.resetButton.addEventListener("click", () => this.resetLayout());
      this.contentCloseButtons.forEach((button) => button.addEventListener("click", (event) => {
        if (event.target === button || button.matches(".content-close")) this.closeContent();
      }));
      this.contentPanel.addEventListener("pointerdown", (event) => event.stopPropagation());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !this.contentOverlay.hidden) this.closeContent();
      });
      this.mounted = true;
      return this;
    }

    open() {
      this.root.hidden = false;
      this.isOpen = true;
    }

    close() {
      this.root.hidden = true;
      this.isOpen = false;
    }

    openContent(entryKey) {
      const content = window.startupContent?.[entryKey];
      if (!content) return;

      this.lastFocusedItem = document.activeElement;
      this.contentKicker.textContent = content.kicker;
      this.contentTitle.textContent = content.title;
      this.contentBody.innerHTML = this.renderContent(entryKey, content);
      this.contentOverlay.hidden = false;
      this.contentPanel.focus({ preventScroll: true });
      this.root.classList.add("has-content-panel");
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
          : `<div class="works-empty"><span class="works-empty-mark">+</span><p>${content.worksNote}</p></div>`;
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
        suppressClick: false,
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
      const maxLeft = this.layout.clientWidth - drag.visualOffsetX - drag.width;
      const maxTop = this.layout.clientHeight - drag.visualOffsetY - drag.height;
      const nextLeft = Math.min(maxLeft, Math.max(minLeft, drag.startLeft + deltaX));
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

      if (drag.item.hasPointerCapture(event.pointerId)) {
        drag.item.releasePointerCapture(event.pointerId);
      }

      if (!drag.dragged) return;

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

  const boot = () => {
    const root = document.querySelector(".stall-stage");
    if (!root) return;

    window.StartupExperience = StartupExperience;
    window.startupExperience = new StartupExperience(root).mount();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    window.setTimeout(boot, 0);
  }
})();
