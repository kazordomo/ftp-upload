const {app, BrowserWindow} = require('electron');

let mainWin;

function createWindow () {
    mainWin = new BrowserWindow({width: 800, height: 600});

    mainWin.loadFile('app/index.html');

    mainWin.webContents.openDevTools();

    mainWin.on('closed', () => {
        mainWin = null;
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWin === null) {
        createWindow();
    }
});