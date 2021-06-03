const path = require('path');

const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

let mainWindow;
let childWindow = null;
let gchildOpts;

const SizeConstants = {
    DEFAULT_WIDTH: 1000,
    DEFAULT_HEIGHT: 720,
    DEFAULT_LOGIN_WIDTH: 420,
    DEFAULT_LOGIN_HEIGHT: 720,
    MIN_LOGIN_WIDTH: 420, // equals DEFAULT_LOGIN_WIDTH
    MIN_LOGIN_HEIGHT: 570,
    DEFAULT_MIN_WIDTH: 470,
    DEFAULT_MIN_HEIGHT: 570,
};

function _createBrowserWindowV2() {
    try {
        if (mainWindow) {
            return console.log('[FEA-MULTI] create mainWindow 2 times');;
        }

        const userAgent = `ZaloPC-win32`;
        const childResourceURL = 'child.html';
        const mainOpts = {
            width: SizeConstants.DEFAULT_LOGIN_WIDTH,
            height: SizeConstants.DEFAULT_LOGIN_HEIGHT,
            minWidth: SizeConstants.MIN_LOGIN_WIDTH,
            minHeight: SizeConstants.MIN_LOGIN_HEIGHT,
            frame: true,
            titleBarStyle: 'hidden',
            resizable: true,
            backgroundColor: '#ffffff',
            show: true,
            webPreferences: {
                webSecurity: false,
                allowRunningInsecureContent: true,
                devTools: true,
                partition: 'persist:zalo',
                webgl: true,
                experimentalFeatures: true,
                experimentalCanvasFeatures: true,
                backgroundThrottling: false,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
            },
        };
        const childOpts = {
            width: SizeConstants.DEFAULT_MIN_WIDTH,
            height: SizeConstants.DEFAULT_MIN_HEIGHT,
            minWidth: SizeConstants.DEFAULT_MIN_WIDTH,
            minHeight: SizeConstants.DEFAULT_MIN_HEIGHT,
            childResourceURL,
        };
        mainWindow = createWithMultiWindow(
            mainOpts,
            childOpts
        );

        mainWindow.loadURL(
            isDev
                ? 'http://localhost:3000'
                : `file://${path.join(__dirname, '../build/index.html')}`
        );
    }
    catch (err) {
        console.log('[FEA-MULTI] Something went wrong', err);
    }
}

function createWithMultiWindow(
    mainOpts,
    childOpts
) {
    try {
        if (mainOpts) {
            mainOpts.webPreferences.nativeWindowOpen = true; // Config it to use child window
            mainOpts.webPreferences.nodeIntegrationInSubFrames = true; // Config it to use child window
        }
        if (childOpts) {
            gchildOpts = childOpts
            gchildOpts.modal = true; // Config it to use child window
            gchildOpts.frame = true;
        }
        console.log('main opts', mainOpts);
        let mainWindow = createMainWindow(mainOpts);
        return mainWindow;
    } catch (err) {
        throw err;
    }
}

function createMainWindow(mainOpts) {
    mainWindow = new BrowserWindow(mainOpts);
    _setupNewWindowEvent(mainWindow);
    return mainWindow;
}


function _setupNewWindowEvent(_window) {
    // Listen to creating child window when it has a request from renderer process
    // _window.webContents.on('-will-add-new-contents', (...args) => {
    //     const [event, url] = args;

    //     //   // Open extenal URL => Use configured onNewWindowCallback to handle the function outside
    //     //   if (!this._isAllowedChildWindowUrl(url)) {
    //     //     event.preventDefault();  
    //     //     if (this.onNewWindowCallback) {
    //     //       this.onNewWindowCallback(event, url);
    //     //     }      
    //     //   }
    // })
    _window.webContents.on('new-window', (...args) => {
        const [event, url, frameName, disposition, options] = args;
        // console.log('_setupNewWindowEvent>args: ', args);
        // external URL had prevented in -will-add-new-contents
        // if (this._isTrustedChildFrame(frameName)) {
        event.preventDefault();
        const position = { x: 100, y: 100 };
        prevPosition = position;

        // Merge configured options of child to main options
        Object.assign(options, {
            ...gchildOpts,
            ...position,
            titleBarStyle: 'hidden',
            resizable: true,
            backgroundColor: 'var(--white-300)',
            show: false,
        });
        console.log('url', url);
        const childURL = url;
        let windowKey = 'child';
        const sizeInfo = {
            width: options.width,
            height: options.height,
            posX: position.x,
            posY: position.y,
            maximize: 0
        }
        childWindow = _createChilWindow(options, childURL, windowKey, sizeInfo);
        childWindow.webContents.openDevTools();
        event.newGuest = childWindow;
    //     } else {
    //         // Other cases
    //         // Example: Open ads but the link is empty
    //         // Avoid crash app when use Electron 7.x and turn on nativeWindowOpen
    //         event.preventDefault();
    //         let childWindow = new BrowserWindow(options);
    //         console.log('child window2', childWindow.webPreferences);
    //         this.instance.loadURL(url);
    //         event.newGuest = childWindow;
    //     }
    });
}

function _createChilWindow(opts, _url, windowKey, sizeInfo) {
    let childWindow = new BrowserWindow(opts);
    // childWindow.loadURL(_url);
    console.log('_createChilWindow> ', opts);
    // if (this.userAgent) {
    //     childWindow.webContents.setUserAgent(this.userAgent);
    // }

    // if (this.isDev) {
    //     // childWindow.webContents.openDevTools();
    // }

    //register childWindow event
    _setupWindowEvent(childWindow, windowKey);

    // configureContextMenu(childWindow);

    // Attach key to childWindowKey
    // this.childs[windowKey] = childWindow;
    // this.childInfoSize[windowKey] = sizeInfo;
    return childWindow;
}

function _setupWindowEvent(_window, windowKey) {
    if (_window) {
        _window
            .once('ready-to-show', () => {
                console.log('ready-tosgow');
                _window.show();
                if (mainWindow) {
                    // Listen event when open modal => send back to parent renderer
                    mainWindow.webContents.send('CHILD_WINDOW_ALIVE', windowKey);
                }
            });
    }
}



// function createWindow() {
//   // Create the browser window.
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//     },
//   });

//   // and load the index.html of the app.
//   // win.loadFile("index.html");
//   win.loadURL(
//     isDev
//       ? 'http://localhost:3000'
//       : `file://${path.join(__dirname, '../build/index.html')}`
//   );
//   // Open the DevTools.
//   if (isDev) {
//     win.webContents.openDevTools();
//   }
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(_createBrowserWindowV2);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});