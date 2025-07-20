const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let images = []; // Lista de imágenes en memoria
let currentImageIndex = 0;
let destinationFolder = null; // Carpeta de destino seleccionada

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => (mainWindow = null));

});

// Selección de carpeta de destino
ipcMain.on('select-destination-folder', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (!result.canceled) {
    destinationFolder = result.filePaths[0];
    event.sender.send('destination-folder-selected', destinationFolder);
  }
});

ipcMain.on('select-folder', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (!result.canceled) {
    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath);
    images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => path.join(folderPath, file));

    currentImageIndex = 0;

    // Enviar la primera imagen al frontend
    if (images.length > 0) {
      event.sender.send('image-loaded', images[currentImageIndex]);
    }
    // Enviar la ruta de la carpeta y la lista de imágenes
    event.sender.send('folder-selected', { folderPath: folderPath, images: images });
  }
});

ipcMain.on('load-next-image', (event) => {
  if (images.length > 0 && currentImageIndex < images.length - 1) {
    currentImageIndex++;
    event.sender.send('image-loaded', images[currentImageIndex]);
  }
});

ipcMain.on('load-previous-image', (event) => {
  if (images.length > 0 && currentImageIndex > 0) {
    currentImageIndex--;
    event.sender.send('image-loaded', images[currentImageIndex]);
  }
});

// Copiar imagen actual a carpeta destino y borrar

ipcMain.on('move-image-to-destination', (event) => {
  if (!destinationFolder || images.length === 0) return;
  const imagePath = images[currentImageIndex];
  const fileName = path.basename(imagePath);
  const destPath = path.join(destinationFolder, fileName);
  try {
    fs.copyFileSync(imagePath, destPath);
    fs.unlinkSync(imagePath);
    images.splice(currentImageIndex, 1);
    if (currentImageIndex >= images.length) currentImageIndex = images.length - 1;
    event.sender.send('image-list-updated', images, currentImageIndex);
  } catch (err) {
    event.sender.send('error', 'No se pudo mover la imagen: ' + err.message);
  }
});

// ...existing code...

// Borrar imagen actual sin copiar

ipcMain.on('delete-image', (event) => {
  if (images.length === 0) return;
  const imagePath = images[currentImageIndex];
  try {
    fs.unlinkSync(imagePath);
    images.splice(currentImageIndex, 1);
    if (currentImageIndex >= images.length) currentImageIndex = images.length - 1;
    event.sender.send('image-list-updated', images, currentImageIndex);
  } catch (err) {
    event.sender.send('error', 'No se pudo borrar la imagen: ' + err.message);
  }
});

// ...existing code...