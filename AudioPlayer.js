(() => {
  const audio = document.querySelector('#bgmAudio');
  const player = document.querySelector('#audioPlayer');
  const toggle = document.querySelector('.audio-toggle');
  const panel = document.querySelector('.audio-panel');
  const volumeInput = document.querySelector('#audioVolume');
  const valueLabel = document.querySelector('#audioVolumeValue');
  if (!audio || !player || !toggle || !panel || !volumeInput) return;

  const storageKey = 'yu-detective-agency:timelooper-volume';
  let savedVolume = Number.NaN;
  try { savedVolume = Number.parseFloat(localStorage.getItem(storageKey)); } catch {}
  const initialVolume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.42;
  let lastAudibleVolume = initialVolume || 0.42;
  let playRequestPending = false;

  const setVolume = (value) => {
    const next = Math.min(1, Math.max(0, Number(value) || 0));
    audio.volume = next;
    volumeInput.value = String(next);
    volumeInput.style.setProperty('--audio-level', `${next * 100}%`);
    valueLabel.textContent = `${Math.round(next * 100)}%`;
    if (next > 0) lastAudibleVolume = next;
    try { localStorage.setItem(storageKey, String(next)); } catch {}
    player.classList.toggle('is-muted', next === 0);
  };

  const setExpanded = (expanded) => {
    player.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? '收起音量调节' : '打开音量调节');
    panel.setAttribute('aria-hidden', String(!expanded));
  };

  const updatePlaybackUi = () => {
    const playing = !audio.paused;
    player.classList.toggle('is-playing', playing);
  };

  const startPlayback = () => {
    if (!audio.paused || playRequestPending) return;
    playRequestPending = true;
    audio.play().catch(() => {}).finally(() => {
      playRequestPending = false;
      updatePlaybackUi();
    });
  };

  setVolume(initialVolume);
  setExpanded(false);
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setExpanded(!player.classList.contains('is-expanded'));
  });
  document.addEventListener('pointerdown', (event) => {
    if (player.classList.contains('is-expanded') && !player.contains(event.target)) setExpanded(false);
  }, { passive: true });
  audio.addEventListener('play', updatePlaybackUi);
  audio.addEventListener('pause', updatePlaybackUi);
  audio.addEventListener('ended', updatePlaybackUi);
  volumeInput.addEventListener('input', (event) => { setVolume(event.target.value); startPlayback(); });
  volumeInput.addEventListener('pointerdown', () => { player.classList.add('is-dragging'); startPlayback(); });
  volumeInput.addEventListener('pointerup', () => player.classList.remove('is-dragging'));
  volumeInput.addEventListener('blur', () => player.classList.remove('is-dragging'));
  player.querySelector('.audio-mute')?.addEventListener('click', () => {
    setVolume(audio.volume > 0 ? 0 : lastAudibleVolume);
  });

  const syncSceneVisibility = () => {
    const stateText = document.body.dataset.interactionState || '';
    let state = {};
    try { state = JSON.parse(stateText); } catch {}
    const focusView = document.body.dataset.focusViewId;
    const isMain = !document.body.classList.contains('opening-active')
      && focusView !== 'transition'
      && (!focusView || focusView === 'mainView')
      && state.isTransitioning !== true;
    player.classList.toggle('is-hidden', !isMain);
    if (!isMain) setExpanded(false);
  };
  const sceneObserver = new MutationObserver(syncSceneVisibility);
  sceneObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-focus-view-id', 'data-interaction-state'] });
  syncSceneVisibility();

  // The opening button is a user gesture, so try immediately before its exit animation.
  window.addEventListener('opening:scene-intro', startPlayback, { once: true });
  window.addEventListener('opening:complete', startPlayback, { once: true });
  document.addEventListener('pointerdown', () => {
    if (audio.paused && !document.body.classList.contains('opening-active')) startPlayback();
  }, { once: true, passive: true });
  updatePlaybackUi();
})();
