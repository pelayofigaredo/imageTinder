const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let images = []; // Lista de imágenes en memoria
let currentImageIndex = 0;

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