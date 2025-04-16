const { ipcRenderer } = require('electron');

const selectFolderButton = document.getElementById('select-folder');
const imageList = document.getElementById('image-list');
const imagePanel = document.getElementById('image-panel');
const nextButton = document.createElement('button');
const prevButton = document.createElement('button');

nextButton.textContent = 'Siguiente';
prevButton.textContent = 'Anterior';

document.body.appendChild(prevButton);
document.body.appendChild(nextButton);

let images = [];
let currentImageIndex = 0;
let currentImagePath = '';

// Seleccionar carpeta
selectFolderButton.addEventListener('click', () => {
  ipcRenderer.send('select-folder');
});

// Recibir lista de imágenes desde el backend
ipcRenderer.on('folder-selected', (event, imagePaths) => {
  images = imagePaths;
  imageList.innerHTML = '';
  currentImageIndex = 0;

  // Mostrar lista de imágenes
  images.forEach((image, index) => {
    const li = document.createElement('li');
    li.textContent = image;
    li.addEventListener('click', () => loadImage(index));
    imageList.appendChild(li);
  });

  // Cargar la primera imagen
  if (images.length > 0) {
    loadImage(0);
  }
});

// Cargar la siguiente imagen
nextButton.addEventListener('click', () => {
  ipcRenderer.send('load-next-image');
});

// Cargar la imagen anterior
prevButton.addEventListener('click', () => {
  ipcRenderer.send('load-previous-image');
});

// Recibir imagen desde el backend
ipcRenderer.on('image-loaded', (event, imagePath) => {
  currentImagePath = imagePath;
  loadImage(imagePath);
});

// Cargar imagen en el panel central
function loadImage(imagePath) {
  imagePanel.innerHTML = `<img src="${imagePath}" alt="Image">`;

  const img = imagePanel.querySelector('img');
  let isPanning = false;
  let startX, startY;
  let offsetX = 0, offsetY = 0;

  // Zoom y pan
  let scale = 1;
  img.style.transformOrigin = 'center center';

  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    scale = Math.min(Math.max(0.5, scale + delta), 3); // Limitar zoom entre 0.5x y 3x
    img.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
  });

  img.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    img.style.cursor = 'grabbing';
  });

  img.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    offsetX += dx / scale;
    offsetY += dy / scale;
    img.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    startX = e.clientX;
    startY = e.clientY;
  });

  img.addEventListener('mouseup', () => {
    isPanning = false;
    img.style.cursor = 'grab';
  });

  img.addEventListener('mouseleave', () => {
    isPanning = false;
    img.style.cursor = 'grab';
  });
}