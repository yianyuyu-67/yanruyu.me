const viewer = document.querySelector('#imageViewer');
const viewerImage = document.querySelector('#viewerImage');
const viewerCaption = document.querySelector('#viewerCaption');

function closeViewer() {
  viewer.classList.remove('show');
  viewer.setAttribute('aria-hidden', 'true');
  viewerImage.src = '';
}

document.querySelectorAll('.photo-frame img').forEach(image => {
  image.addEventListener('click', () => {
    const frame = image.closest('.photo-frame');
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt;
    viewerCaption.textContent = frame?.dataset.caption || image.alt;
    viewer.classList.add('show');
    viewer.setAttribute('aria-hidden', 'false');
  });
});

document.querySelector('#viewerClose').addEventListener('click', closeViewer);
viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeViewer(); });
document.querySelector('#printButton').addEventListener('click', () => window.print());
