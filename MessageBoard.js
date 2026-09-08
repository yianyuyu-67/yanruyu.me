const STORAGE_KEY = 'detective-lodge-message-board-v1';
const PASSWORD = '402607'; // 私密便签的趣味解锁码（小予拍板）；真正的审核密钥在服务端环境变量里
const API_URL = '/api/messages';
const MAX_LENGTH = 200;
const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'orange'];
const NOTE_POSITIONS = [
  { x: 8, y: 10 }, { x: 31, y: 9 }, { x: 67, y: 10 }, { x: 86, y: 20 },
  { x: 12, y: 38 }, { x: 77, y: 40 }, { x: 6, y: 65 }, { x: 86, y: 68 },
  { x: 30, y: 72 }, { x: 61, y: 69 }, { x: 47, y: 25 }, { x: 48, y: 83 }
];

function uid() { return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

export class MessageBoard {
  constructor({ overlay, board, input, modeToggle, publishButton, closeButton, reducedMotion = false, onClose } = {}) {
    this.overlay = overlay;
    this.board = board;
    this.input = input;
    this.modeToggle = modeToggle;
    this.publishButton = publishButton;
    this.closeButton = closeButton;
    this.reducedMotion = reducedMotion;
    this.onClose = onClose;
    this.notes = [];
    this.cloudNotes = [];
    this.cloudReady = false;
    this.unlocked = new Set();
    this.isOpen = false;
    this.modal = overlay?.querySelector('.message-password-modal');
    this.passwordInput = overlay?.querySelector('.message-password-input');
    this.passwordError = overlay?.querySelector('.message-password-error');
    this.status = overlay?.querySelector('.message-board-status');
    this.counter = overlay?.querySelector('.message-char-count');
    this._boundKeydown = event => this.handleKeydown(event);
    this._boundPointer = event => this.handleOverlayPointer(event);
  }

  mount() {
    if (!this.overlay) return;
    this.load();
    this.syncCloud();
    this.input?.addEventListener('input', () => this.updateCounter());
    this.modeToggle?.addEventListener('click', event => {
      const button = event.target.closest('[data-message-mode]');
      if (!button) return;
      this.setMode(button.dataset.messageMode);
    });
    this.publishButton?.addEventListener('click', () => this.publish());
    this.closeButton?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('pointerdown', this._boundPointer);
    document.addEventListener('keydown', this._boundKeydown);
    this.overlay.querySelector('.message-password-form')?.addEventListener('submit', event => {
      event.preventDefault();
      this.unlock();
    });
    this.overlay.querySelector('.message-password-cancel')?.addEventListener('click', () => this.closePassword());
    this.updateCounter();
    this.setMode('public');
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        this.notes = [
          this.makeNote('欢迎来到留言板，留下你的观察。', 'public', 'yellow', 0),
          this.makeNote('每一张便签都是一次相遇。', 'public', 'pink', 1),
          this.makeNote('这是一条私密线索。', 'private', 'green', 2)
        ];
        this.save();
      } else {
        const parsed = JSON.parse(raw);
        this.notes = Array.isArray(parsed) ? parsed.filter(note => note && typeof note.text === 'string') : [];
      }
    } catch {
      this.notes = [];
    }
  }

  save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes)); } catch { /* storage may be unavailable */ } }

  // 云端同步：拉取已审核通过的留言；失败时静默回退纯本地模式
  async syncCloud() {
    try {
      const res = await fetch(API_URL, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.messages)) throw new Error('bad payload');
      this.cloudNotes = data.messages.map(row => ({
        id: `c-${row.id}`,
        text: String(row.text || ''),
        visibility: row.visibility === 'private' ? 'private' : 'public',
        color: NOTE_COLORS.includes(row.color) ? row.color : 'yellow',
        rotation: Number(row.rotation) || 0,
        position: { x: Number(row.position?.x) || 50, y: Number(row.position?.y) || 50 },
        cloud: true
      }));
      this.cloudReady = true;
      if (this.isOpen) this.render();
    } catch {
      this.cloudNotes = [];
      this.cloudReady = false;
    }
  }

  makeNote(text, visibility, color, index = this.notes.length) {
    const base = NOTE_POSITIONS[index % NOTE_POSITIONS.length];
    const cycle = Math.floor(index / NOTE_POSITIONS.length);
    return {
      id: uid(), text, visibility, color: color || NOTE_COLORS[index % NOTE_COLORS.length],
      rotation: [-3, 2, -1, 3, -2, 1][index % 6],
      position: { x: Math.min(88, base.x + cycle * 2), y: Math.min(86, base.y + cycle * 2) }, createdAt: Date.now()
    };
  }

  open() {
    if (!this.overlay) return;
    clearTimeout(this.closeTimer);
    this.isOpen = true;
    this.overlay.classList.add('show');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.render();
    this.updateCounter();
    requestAnimationFrame(() => this.overlay.classList.add('is-visible'));
  }

  close() {
    if (!this.isOpen) return;
    this.closePassword();
    this.isOpen = false;
    this.overlay.classList.remove('is-visible');
    this.overlay.setAttribute('aria-hidden', 'true');
    const finish = () => { this.overlay.classList.remove('show'); this.onClose?.(); };
    if (this.reducedMotion) finish(); else this.closeTimer = setTimeout(finish, 220);
  }

  render() {
    const root = this.overlay.querySelector('.message-notes');
    if (!root) return;
    root.replaceChildren();
    [...this.notes, ...this.cloudNotes].forEach(note => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `message-note note-${note.color}`;
      element.dataset.noteId = note.id;
      element.style.left = `${note.position?.x ?? 50}%`;
      element.style.top = `${note.position?.y ?? 50}%`;
      element.style.setProperty('--note-rotation', `${note.rotation || 0}deg`);
      const isPrivate = note.visibility === 'private';
      const isUnlocked = this.unlocked.has(note.id);
      element.textContent = isPrivate && !isUnlocked ? '***' : note.text;
      element.setAttribute('aria-label', isPrivate && !isUnlocked ? '私密留言，点击输入密码解锁' : `留言：${note.text}`);
      element.addEventListener('pointerdown', event => this.startDrag(event, note, element));
      element.addEventListener('click', () => this.handleNoteClick(note));
      root.appendChild(element);
    });
  }

  handleNoteClick(note) {
    if (this.draggedNoteId === note.id) {
      this.draggedNoteId = null;
      return;
    }
    if (note.visibility !== 'private' || this.unlocked.has(note.id)) return;
    this.openPassword(note);
  }

  startDrag(event, note, element) {
    if (event.button !== 0 || !this.board) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = this.board.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPosition = { x: note.position?.x ?? 50, y: note.position?.y ?? 50 };
    let moved = false;
    element.classList.add('is-dragging');
    element.setPointerCapture?.(event.pointerId);
    const move = moveEvent => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      const x = Math.max(6, Math.min(94, startPosition.x + (dx / rect.width) * 100));
      const y = Math.max(7, Math.min(90, startPosition.y + (dy / rect.height) * 100));
      note.position = { x, y };
      element.style.left = `${x}%`;
      element.style.top = `${y}%`;
    };
    const end = () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', end);
      element.removeEventListener('pointercancel', end);
      element.classList.remove('is-dragging');
      if (moved) {
        this.draggedNoteId = note.id;
        this.save();
        setTimeout(() => { if (this.draggedNoteId === note.id) this.draggedNoteId = null; }, 0);
      }
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
  }

  openPassword(note) {
    this.pendingNote = note;
    this.passwordError.textContent = '';
    this.passwordInput.value = '';
    this.modal.classList.add('show');
    this.modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => this.passwordInput.focus());
  }

  closePassword() {
    if (!this.modal) return;
    this.modal.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
    this.pendingNote = null;
  }

  unlock() {
    if (!this.pendingNote) return;
    if (this.passwordInput.value.trim() !== PASSWORD) {
      this.passwordError.textContent = '密码不正确，请再试一次。';
      this.passwordInput.select();
      return;
    }
    this.unlocked.add(this.pendingNote.id);
    this.closePassword();
    this.render();
  }

  setMode(mode) {
    const value = mode === 'private' ? 'private' : 'public';
    this.overlay.dataset.messageMode = value;
    this.modeToggle?.querySelectorAll('[data-message-mode]').forEach(button => {
      const active = button.dataset.messageMode === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  updateCounter() {
    if (!this.input || !this.counter) return;
    const length = [...this.input.value].length;
    this.counter.textContent = `${length} / ${MAX_LENGTH}`;
    this.counter.classList.toggle('is-over', length > MAX_LENGTH);
  }

  publish() {
    const text = this.input?.value.trim() || '';
    this.updateCounter();
    if (!text) { this.showStatus('请先写下一条留言。'); this.input?.focus(); return; }
    if ([...text].length > MAX_LENGTH) { this.showStatus(`留言最多 ${MAX_LENGTH} 个字符。`); return; }
    const note = this.makeNote(text, this.overlay.dataset.messageMode || 'public', NOTE_COLORS[this.notes.length % NOTE_COLORS.length], this.notes.length);
    this.notes.push(note); this.save(); this.input.value = ''; this.setMode('public'); this.updateCounter();
    this.showStatus(this.cloudReady ? '已贴上，待所长审核后向大家公开。' : '留言已贴到留言板。');
    this.render();
    this.animateNote(note);
    this.submitToCloud(note);
  }

  async submitToCloud(note) {
    if (!this.cloudReady) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: note.text, visibility: note.visibility, color: note.color, rotation: note.rotation, position: note.position })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) { this.showStatus('你贴得太快啦，休息几分钟再试。'); return; }
      if (!res.ok || !data.ok) throw new Error('submit failed');
    } catch {
      this.showStatus('云端暂时没连上，这条先留在你的浏览器里。');
    }
  }

  animateNote(note) {
    const element = this.overlay.querySelector(`[data-note-id="${note.id}"]`);
    if (!element || this.reducedMotion || !element.animate) return;
    const boardRect = this.board.getBoundingClientRect();
    const paper = this.overlay.querySelector('.message-input-paper')?.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    const fromX = (paper ? paper.left + paper.width / 2 : boardRect.left + boardRect.width / 2) - (target.left + target.width / 2);
    const fromY = (paper ? paper.top + paper.height / 2 : boardRect.top + boardRect.height / 2) - (target.top + target.height / 2);
    element.animate([
      { transform: `translate(${fromX}px, ${fromY}px) rotate(-8deg) scale(.72)`, opacity: 0 },
      { transform: `translate(${fromX * -.08}px, ${fromY * -.08}px) rotate(${note.rotation + 2}deg) scale(1.04)`, opacity: 1, offset: .78 },
      { transform: `rotate(${note.rotation}deg) scale(1)`, opacity: 1 }
    ], { duration: 720, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  showStatus(message) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.classList.add('show');
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => this.status.classList.remove('show'), 2200);
  }

  handleOverlayPointer(event) {
    if (event.target === this.overlay) this.close();
    if (this.modal?.classList.contains('show') && event.target === this.modal) this.closePassword();
  }

  handleKeydown(event) {
    if (!this.isOpen || event.key !== 'Escape') return;
    if (this.modal?.classList.contains('show')) { this.closePassword(); event.stopPropagation(); return; }
    this.close();
  }
}

export default MessageBoard;
