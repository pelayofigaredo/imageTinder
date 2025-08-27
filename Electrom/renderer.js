const { ipcRenderer } = require('electron');

const selectFolderButton = document.getElementById('select-folder');
const selectDestinationFolderButton = document.getElementById('select-destination-folder');
const imagePanel = document.getElementById('image-panel');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
const sourceFolderLabel = document.getElementById('source-folder-label');
const destinationFolderLabel = document.getElementById('destination-folder-label');
const langEsBtn = document.getElementById('lang-es');
const langEnBtn = document.getElementById('lang-en');
const imageCountLabel = document.getElementById('image-count-label');

let images = [];
let currentImageIndex = 0;
let currentImagePath = '';
let destinationFolder = null;
let sourceFolder = null;
let currentLang = localStorage.getItem('lang') || 'es';

function t(key, ...args) {
  const value = window.translations[currentLang][key];
  return typeof value === 'function' ? value(...args) : value;
}

function updateTexts() {
  selectFolderButton.textContent = t('selectFolder');
  selectDestinationFolderButton.textContent = t('selectDestFolder');
  prevButton.textContent = t('prev');
  nextButton.textContent = t('next');
  // Si ya hay paths seleccionados, mantenerlos, si no, poner texto por defecto
  sourceFolderLabel.textContent = sourceFolder ? t('source') + ': ' + sourceFolder : t('selectFolder');
  destinationFolderLabel.textContent = destinationFolder ? t('destination') + ': ' + destinationFolder : t('selectDestFolder');
  // El label de cantidad de imágenes se actualiza en los handlers
}

// Botones de idioma
langEsBtn.addEventListener('click', () => {
  if (currentLang !== 'es') {
    currentLang = 'es';
    localStorage.setItem('lang', currentLang);
    updateTexts();
    if (typeof images !== 'undefined') {
      imageCountLabel.textContent = t('imagesFound', images.length);
    }
    console.log('[renderer] Enviando set-lang:', currentLang);
    ipcRenderer.send('set-lang', currentLang);
  }
});
langEnBtn.addEventListener('click', () => {
  if (currentLang !== 'en') {
    currentLang = 'en';
    localStorage.setItem('lang', currentLang);
    updateTexts();
    if (typeof images !== 'undefined') {
      imageCountLabel.textContent = t('imagesFound', images.length);
    }
    console.log('[renderer] Enviando set-lang:', currentLang);
    ipcRenderer.send('set-lang', currentLang);
  }
});

// Etiquetas iniciales
updateTexts();
// Notificar idioma inicial al main process
ipcRenderer.send('init-lang', currentLang);

// Seleccionar carpeta
selectFolderButton.addEventListener('click', () => {
  ipcRenderer.send('select-folder');

});

// Seleccionar carpeta de destino
selectDestinationFolderButton.addEventListener('click', () => {
  ipcRenderer.send('select-destination-folder');
});

ipcRenderer.on('destination-folder-selected', (event, folderPath) => {
  destinationFolder = folderPath;
  updateTexts();
});

// Recibir lista de imágenes desde el backend
ipcRenderer.on('folder-selected', (event, data) => {
  images = data.images;
  currentImageIndex = 0;
  sourceFolder = data.folderPath;
  updateTexts();
  imageCountLabel.textContent = t('imagesFound', images.length);
  // Cargar la primera imagen
  if (images.length > 0) {
    currentImagePath = images[0];
    loadImage(images[0]);
  } else {
    imagePanel.innerHTML = '<p>No hay imágenes.</p>';
    currentImagePath = '';
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

// Actualizar lista de imágenes después de mover/borrar
ipcRenderer.on('image-list-updated', (event, updatedImages, newIndex) => {
  images = updatedImages;
  currentImageIndex = newIndex >= 0 ? newIndex : 0;
  imageCountLabel.textContent = t('imagesFound', images.length);
  if (images.length > 0) {
    loadImage(images[currentImageIndex]);
  } else {
    imagePanel.innerHTML = '<p>' + (currentLang === 'es' ? 'No hay imágenes.' : 'No images.') + '</p>';
    currentImagePath = '';
  }
});

ipcRenderer.on('error', (event, message) => {
  alert((window.translations[currentLang].error || 'Error') + ': ' + message);
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

// Escuchar teclas de flecha para mover/borrar imágenes
window.addEventListener('keydown', (e) => {
  if (!sourceFolder || !destinationFolder) {
    alert(t('mustSelectFolders'));
    return;
  }
  if (!currentImagePath) {
    console.log(t('noImageLoaded'));
    return;
  }
  if (e.key === 'ArrowRight') {
    ipcRenderer.send('move-image-to-destination');
    console.log('Enviando move-image-to-destination');
  } else if (e.key === 'ArrowLeft') {
    ipcRenderer.send('delete-image');
    console.log('Enviando delete-image');
  } else if (e.key === 'ArrowDown') {
    ipcRenderer.send('undo-last-action');
    console.log('Enviando undo-last-action');
  } else if (e.code === 'Space') {
    ipcRenderer.send('open-in-explorer');
    console.log('Abriendo explorador en la imagen actual');
  }
});

function pathSeparator() {
  return window.navigator.platform.startsWith('Win') ? '\\' : '/';
}

