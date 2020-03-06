const {
    app,
    BrowserWindow,
    screen,
    Menu,
    shell,
    Tray,
    ipcMain
} = require( 'electron' )
const path = require( 'path' )


const myApp = {
    mainWindow : null,
    pickedWindow : null,
    windowOpen : true,
    menu : null,
    tray : null, //musi byc globalne bo inaczej garbage collector sprawia ze nie mia ikonki w trayu

    toggleMainWindow() {
        this.windowOpen = !this.windowOpen;

        if (this.windowOpen) {
            this.mainWindow.hide();
        } else {
            this.mainWindow.show();
            this.mainWindow.restore();
        }
    },

    createMainWindow() {
        const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

        this.mainWindow = new BrowserWindow({
            icon : path.join(__dirname, './images/icon.ico'),
            width: 400,
            height: screenH,
            x: screenW - 400,
            y: 0,
            webPreferences: {
                nodeIntegration: true
            }
        });

        this.mainWindow.loadFile('index.html');

        this.mainWindow.on('minimize', function(event){
            event.preventDefault();
            this.mainWindow.hide();
        });

        const imgPath = path.join(__dirname, './images/icon.ico');
        this.tray = new Tray(imgPath);
        this.tray.setToolTip('kolory');
        this.tray.on('click', () => {
            this.toggleMainWindow();
        });

        //Menu.setApplicationMenu( null );
    },

    createColorPickWindow() {
        this.pickedWindow = new BrowserWindow({
            icon : path.join(__dirname, './images/icon.ico'),
            fullscreen: true,
            alwaysOnTop: true,
            transparent: true,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });

        this.pickedWindow.loadFile('pick-color.html');
        //pickedWindow.webContents.openDevTools()
    },

    bindCommunication() {
        ipcMain.on('createColorPickWindow', (event, file, content) => {
            this.createColorPickWindow();
        });

        ipcMain.on('colorPicked', (event, messages) => {
            this.mainWindow.webContents.send("pickedColor", {color: messages})
        });
    },

    init() {
        app.on( 'ready', () => this.createMainWindow() )

        app.on( 'window-all-closed', function() {
            if ( process.platform !== 'darwin' ) app.quit()
        });

        app.on( 'activate', function() {
            if ( BrowserWindow.getAllWindows().length === 0 ) {
                this.createWindow();
            }
        });

        this.bindCommunication();
    }
}

myApp.init();
