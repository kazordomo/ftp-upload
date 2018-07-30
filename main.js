const {app, BrowserWindow, Menu} = require('electron');
const { zipProject } = require('./app/utils');

let mainWin;

function createWindow () {
    mainWin = new BrowserWindow({width: 800, height: 600});

    mainWin.loadFile('app/index.html');

    mainWin.webContents.openDevTools();

    mainWin.on('closed', () => {
        mainWin = null;
    });
}

app.on('ready', () => {
    createWindow();
    const template = [
        {
            label: 'Actions',
            submenu: [
                {
                    label: 'Download project',
                    click: zipProject,
                }
            ],
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'toggledevtools'},
            ],
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
})

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