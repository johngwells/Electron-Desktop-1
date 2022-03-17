const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// nodeIntergration fixes issue of require undefined
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(`file://${__dirname}/main.html`);
  mainWindow.on('closed', () => app.quit());
  console.log('Ready!!!');
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    width: 300,
    height: 200,
    title: 'Add New Snack'
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);

  // cleanup: removes the garbage collection when window auto closes
  addWindow.on('closed', () => (addWindow = null));
}

ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
});

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Snacks',
        accelerator: 'Command+N',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Snacks',
        accelerator: 'DELETE',
        click() {
          mainWindow.webContents.send('todo:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// suppose to remove the electron tab but can't leave an object empty?
if (process.platform === 'darwin') {
  menuTemplate.unshift({ label: '' });
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
