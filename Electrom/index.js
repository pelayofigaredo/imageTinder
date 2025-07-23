function openHelpWindow() {
  const helpWindow = new BrowserWindow({
    width: 500,
    height: 500,
    title: "Ayuda",
    modal: true,
    parent: mainWindow,
    resizable: false,
    minimizable: false,
    maximizable: false,
    icon: path.join(__dirname, 'res/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  helpWindow.loadFile('help.html');
}

// Procesa la acción pendiente de lastImage (mover o borrar)
function processLastImageAction(event) {
  if (!lastImage) return;
  if (lastImage.action === 'move') {
    try {
      fs.copyFileSync(lastImage.imagePath, lastImage.destPath);
      fs.unlinkSync(lastImage.imagePath);
    } catch (err) {
      event.sender.send('error', 'No se pudo completar el movimiento anterior: ' + err.message);
    }
  } else if (lastImage.action === 'delete') {
    try {
      fs.unlinkSync(lastImage.imagePath);
    } catch (err) {
      event.sender.send('error', 'No se pudo completar el borrado anterior: ' + err.message);
    }
  }
  lastImage = null;
}


const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let images = []; // Lista de imágenes en memoria
let lastImage;
let currentImageIndex = 0;
let destinationFolder = null; // Carpeta de destino seleccionada

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'res/icon.ico'),
    title: "Image Tinder",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Crear menú personalizado solo con Ayuda
  const { Menu } = require('electron');
  const menuTemplate = [
    {
      label: 'Ayuda',
      submenu: [
        {
          label: '¿Cómo funciona?',
          click: () => {
            openHelpWindow();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => {
    try {
      if (mainWindow && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        processLastImageAction({ sender: mainWindow.webContents });
      } else {
        processLastImageAction({ sender: { send: () => {} } });
      }
    } catch (e) {
      // Diosito no me mates, pero no me dejes sin procesar la última acción
    }
    mainWindow = null;
  });

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
  // Procesar la acción pendiente antes de cambiar de carpeta
  processLastImageAction(event);
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
  processLastImageAction(event);
  const imagePath = images[currentImageIndex];
  const fileName = path.basename(imagePath);
  const destPath = path.join(destinationFolder, fileName);
  try {
    // No borrar ni copiar realmente, solo guardar referencia para rectificar
    lastImage = {
      action: 'move',
      imagePath,
      destPath,
      index: currentImageIndex
    };
    images.splice(currentImageIndex, 1);
    if (currentImageIndex >= images.length) currentImageIndex = images.length - 1;
    event.sender.send('image-list-updated', images, currentImageIndex);
  } catch (err) {
    event.sender.send('error', 'No se pudo mover la imagen: ' + err.message);
  }
});

ipcMain.on('open-help', openHelpWindow);

// Borrar imagen actual sin copiar

ipcMain.on('delete-image', (event) => {
  if (images.length === 0) return;
  processLastImageAction(event);
  const imagePath = images[currentImageIndex];
  try {
    // No borrar realmente, solo guardar referencia para rectificar
    lastImage = {
      action: 'delete',
      imagePath,
      index: currentImageIndex
    };
    images.splice(currentImageIndex, 1);
    if (currentImageIndex >= images.length) currentImageIndex = images.length - 1;
    event.sender.send('image-list-updated', images, currentImageIndex);
  } catch (err) {
    event.sender.send('error', 'No se pudo borrar la imagen: ' + err.message);
  }
});
// Rectificar el último cambio
ipcMain.on('undo-last-action', (event) => {
  if (!lastImage) {
    event.sender.send('error', 'No hay acción para rectificar.');
    return;
  }
  if (lastImage.action === 'move') {
    // Solo restaurar la imagen en la lista, no copiar ni borrar archivos
    images.splice(lastImage.index, 0, lastImage.imagePath);
    currentImageIndex = lastImage.index;
    event.sender.send('image-list-updated', images, currentImageIndex);
  } else if (lastImage.action === 'delete') {
    images.splice(lastImage.index, 0, lastImage.imagePath);
    currentImageIndex = lastImage.index;
    event.sender.send('image-list-updated', images, currentImageIndex);
  }
  lastImage = null;
});

// ...existing code...