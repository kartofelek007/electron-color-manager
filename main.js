const {
    app,
    BrowserWindow,
    screen,
    Menu,
    shell,
    Tray,
    ipcMain,
    nativeImage
    } = require('electron');
const path = require('path');
const debug = process.argv.includes("debug");

const myApp = {
    mainWindow: null,
    contextMenu: false,
    pickedWindow: null,
    menu: null,
    tray: null, //musi byc globalne bo inaczej garbage collector sprawia ze nie mia ikonki w trayu

    toggleMainWindow(show) {
        if (!show) {
            this.mainWindow.hide();
        } else {
            this.mainWindow.show();
            this.mainWindow.restore();
        }
    },

    createMainWindow() {
        const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

        this.mainWindow = new BrowserWindow({
            icon: path.join(__dirname, '/images/icon.png'),
            width: 360,
            height: screenH,
            x: screenW - 360,
            y: 0,
            alwaysOnTop: false,
            maximizable: false,
            frame: true,
            tabbingIdentifier: "Colors",
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        this.mainWindow.loadFile('index.html');

        //this.mainWindow.hide();

        this.mainWindow.on('minimize', e => {
            e.preventDefault();
            this.mainWindow.hide();
        });

        const imgPath = path.join(__dirname, '/images/icon.png');

        this.tray = new Tray(imgPath);
        this.tray.setToolTip('kolory');
        this.tray.on('click', () => {
            this.toggleMainWindow(true);
        });

        Menu.setApplicationMenu(null);

        if (debug) {
            this.mainWindow.webContents.openDevTools()
        }
    },

    createContextMenu() {
        this.contextMenu = Menu.buildFromTemplate([
            {
                label: 'Author',
                role: 'help',
                click: () => {
                    shell.openExternal('http://domanart.pl/portfolio');
                }
            },
            {
                label: 'Quit program',
                role: 'close',
                click: () => {
                    this.mainWindow.close()
                }
            }
        ]);
        this.tray.setContextMenu(this.contextMenu);
    },

    createColorPickWindow() {
        const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

        this.pickedWindow = new BrowserWindow({
            icon: path.join(__dirname, './images/icon.png'),
            fullscreen: true,
            // x: 0,
            // y : 0,
            // width: screenW,
            // height: screenH,
            alwaysOnTop: true,
            movable: false,
            minimizable: false,
            maximizable: false,
            transparent: true,
            tabbingIdentifier: "Colors",
            frame: false,
            hide: true,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        //this.pickedWindow.webContents.openDevTools()

        this.pickedWindow.loadFile('pick-color.html');
        this.pickedWindow.once('ready-to-show', () => {
            this.pickedWindow.show();
        });
        //this.pickedWindow.webContents.openDevTools()
    },

    bindCommunication() {
        ipcMain.on('createColorPickWindow', (event, file, content) => {
            this.createColorPickWindow();
            this.mainWindow.hide();
        });

        ipcMain.on('closeColorPickWindow', (event, file, content) => {
            this.pickedWindow.close();
            this.toggleMainWindow(true);
        });

        ipcMain.on('colorPicked', (event, messages) => {
            this.mainWindow.webContents.send("pickedColor", {color: messages})
        });
    },

    init() {
        app.commandLine.appendSwitch('disable-transparent-visuals');
        app.commandLine.appendSwitch('disable-gpu');

        app.on('ready', () => {
            this.createMainWindow();
            this.createContextMenu();
        });

        app.on('window-all-closed', function() {
            if (process.platform !== 'darwin') app.quit()
        });

        app.on('activate', function() {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });

        this.bindCommunication();
    }
};

myApp.init();
