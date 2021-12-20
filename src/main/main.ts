import path from 'path';
import { app, BrowserWindow } from 'electron';

import AppModule from './modules/app';
import ApplicationMenuModule from './modules/application-menu';
import TrayModule from './modules/tray';
import ConfigModule from './modules/config';
import PowerModule from './modules/power-monitor';
import ThumbarModule from './modules/thumbar';
import DockMenuModule from './modules/dock-menu-darwin';
import GlobalShortcutsModule from './modules/global-shortcuts';
import SleepBlockerModule from './modules/sleep-blocker';
import MprisModule from './modules/mpris';
import DialogsModule from './modules/dialogs';
import NativeThemeModule from './modules/native-theme';
import DevtoolsModule from './modules/devtools';

import * as ModulesManager from './lib/modules-manager';
import { checkBounds } from './lib/utils';

const appRoot = path.resolve(__dirname, '..'); // Careful, not future-proof
const rendererDistPath = path.join(appRoot, 'renderer');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow: Electron.BrowserWindow | null = null;

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// This method will be called when Electron has finished its
// initialization and ready to create browser windows.
app.on('ready', async () => {
  const configModule = new ConfigModule();
  await ModulesManager.init(configModule);

  const config = configModule.getConfig();
  const bounds = checkBounds(config.bounds);

  // Create the browser window
  mainWindow = new BrowserWindow({
    title: 'Museeks',
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 550,
    frame: true,
    autoHideMenuBar: false,
    titleBarStyle: 'hiddenInset', // MacOS polished window
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  // Open dev tools if museeks is run in debug mode
  if (process.argv.includes('--devtools')) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  // Prevent webContents from opening new windows (e.g ctrl-click on link)
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // ... and load the html page generated by ESBuild
  mainWindow.loadURL(`file://${rendererDistPath}/app.html#/${config.defaultView}`);

  // Let's list the list of modules we will use for Museeks
  ModulesManager.init(
    new AppModule(mainWindow, configModule),
    new PowerModule(mainWindow),
    new ApplicationMenuModule(mainWindow),
    new TrayModule(mainWindow),
    new ThumbarModule(mainWindow),
    new DockMenuModule(mainWindow),
    new GlobalShortcutsModule(mainWindow),
    new SleepBlockerModule(mainWindow),
    new MprisModule(mainWindow),
    new DialogsModule(mainWindow),
    new NativeThemeModule(mainWindow, configModule),
    new DevtoolsModule(mainWindow)
  ).catch(console.error);
});
