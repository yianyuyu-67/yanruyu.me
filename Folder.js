const darkenColor = (hex, percent) => {
  let color = String(hex || '#5227FF').replace(/^#/, '');
  if (color.length === 3) color = color.split('').map(char => char + char).join('');
  const value = Number.parseInt(color.slice(0, 6), 16);
  if (!Number.isFinite(value)) return '#4785FF';
  const channel = shift => Math.max(0, Math.min(255, Math.floor(((value >> shift) & 0xff) * (1 - percent))));
  return `#${[16, 8, 0].map(channel).map(part => part.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
};

/**
 * React Bits Folder adapted to a small DOM factory for this no-build project.
 * The markup and motion classes intentionally mirror the JS-CSS registry item.
 */
export function createFolder({ color = '#5227FF', titleColor = '#FFF9E8', titleScale = 1, titleLineHeight = 0.82, size = 1, items = [], label = '', faceTitle = '', faceSubtitle = '', onOpen } = {}) {
  const root = document.createElement('div');
  root.className = 'folder-component';
  root.style.setProperty('--folder-scale', String(size));

  const folder = document.createElement('div');
  folder.className = 'folder';
  folder.tabIndex = 0;
  folder.setAttribute('role', 'button');
  folder.setAttribute('aria-expanded', 'false');
  folder.setAttribute('aria-label', label ? `打开${label}文件夹` : '打开文件夹');
  folder.style.setProperty('--folder-color', color);
  folder.style.setProperty('--folder-back-color', darkenColor(color, 0.08));
  folder.style.setProperty('--folder-title-color', titleColor);
  folder.style.setProperty('--folder-title-scale', String(titleScale));
  folder.style.setProperty('--folder-title-line-height', String(titleLineHeight));
  folder.style.setProperty('--paper-1', '#E6E6E6');
  folder.style.setProperty('--paper-2', '#F2F2F2');
  folder.style.setProperty('--paper-3', '#FFFFFF');

  const back = document.createElement('div');
  back.className = 'folder__back';
  [items[0], items[1], items[2]].forEach((item, index) => {
    const paper = document.createElement('div');
    paper.className = `paper paper-${index + 1}`;
    if (item) paper.textContent = item;
    back.appendChild(paper);
  });
  const front = document.createElement('div');
  front.className = 'folder__front';
  const right = document.createElement('div');
  right.className = 'folder__front right';
  let titleElement = null;
  if (faceTitle || faceSubtitle || label) {
    const content = document.createElement('div');
    content.className = 'folder__content';
    if (faceTitle || label) {
      titleElement = document.createElement('span');
      titleElement.className = 'folder__title';
      titleElement.textContent = faceTitle || label;
      content.appendChild(titleElement);
    }
    if (faceSubtitle) {
      const subtitle = document.createElement('span');
      subtitle.className = 'folder__subtitle';
      subtitle.textContent = faceSubtitle;
      content.appendChild(subtitle);
    }
    right.appendChild(content);
  }
  back.append(front, right);
  folder.appendChild(back);
  root.appendChild(folder);

  // Keep long display words inside the folder at every viewport size. The
  // initial CSS scale is still used; this only trims the rendered size when
  // the loaded font's measured width is wider than the front panel.
  const fitTitle = () => {
    if (!titleElement) return;
    titleElement.style.fontSize = '';
    let size = Number.parseFloat(getComputedStyle(titleElement).fontSize);
    const maxWidth = titleElement.clientWidth;
    if (!maxWidth) return;
    let guard = 0;
    while (titleElement.scrollWidth > maxWidth && size > 16 && guard++ < 24) {
      size *= 0.93;
      titleElement.style.fontSize = `${size}px`;
    }
  };
  if (titleElement) {
    requestAnimationFrame(fitTitle);
    window.addEventListener('resize', fitTitle, { passive: true });
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(fitTitle);
      observer.observe(folder);
    }
    if (document.fonts?.ready) document.fonts.ready.then(fitTitle);
  }

  let open = false;
  const toggle = () => {
    open = !open;
    folder.classList.toggle('open', open);
    folder.setAttribute('aria-expanded', String(open));
    folder.setAttribute('aria-label', open ? `关闭${label || ''}文件夹` : `打开${label || ''}文件夹`);
    if (open && typeof onOpen === 'function') onOpen({ folder, root });
  };
  folder.addEventListener('click', toggle);
  folder.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
  return { root, folder, open: () => { if (!open) toggle(); }, close: () => { if (open) toggle(); } };
}

export { darkenColor };
