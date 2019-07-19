import * as path from 'path';
import * as electron from 'electron';

import IpcModule from './modules/ipc';
import MenuModule from './modules/menu';
import TrayModule from './modules/tray';
import ConfigModule from './modules/config';
import PowerModule from './modules/power-monitor';
import ThumbarModule from './modules/thumbar';
import DockMenuModule from './modules/dock-menu-darwin';
import GlobalShortcutsModule from './modules/global-shortcuts';
import SleepBlockerModule from './modules/sleep-blocker';
import MprisModule from './modules/mpris';

import * as ModulesManager from './lib/modules-manager';
import { checkBounds } from './utils';

const { app, BrowserWindow } = electron;

const appRoot = path.resolve(__dirname, '../..'); // Careful, not future-proof
const uiDistPath = path.join(appRoot, 'dist/ui');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow: Electron.BrowserWindow | null = null;

// Make the app a single-instance app
const gotTheLock = app.requestSingleInstanceLock();

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (!gotTheLock) {
  app.quit();
}

// Fix the player not being able to play audio when the user did not interact
// with the page
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Let's list the list of modules we will use for Museeks

// This method will be called when Electron has finished its
// initialization and ready to create browser windows.
app.on('ready', async () => {
  const configModule = new ConfigModule();
  await ModulesManager.init(configModule);

  const config = configModule.getConfig();
  let { bounds } = config;

  bounds = checkBounds(bounds);

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
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset', // MacOS polished window
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // ... and load the html page generated by Webpack
  mainWindow.loadURL(`file://${uiDistPath}/index.html#/library`);

  // Open dev tools if museeks is run in debug mode
  // @ts-ignore I don't know why it triggers this error
  if (process.argv.includes('--devtools')) mainWindow.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Click on the dock icon to show the app again on macOS
  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Prevent webContents from opening new windows (e.g ctrl-click on link)
  mainWindow.webContents.on('new-window', (e) => {
    e.preventDefault();
  });

  ModulesManager.init(
    new IpcModule(mainWindow, configModule),
    new PowerModule(mainWindow),
    new MenuModule(mainWindow),
    new TrayModule(mainWindow, configModule),
    new ThumbarModule(mainWindow),
    new DockMenuModule(mainWindow),
    new GlobalShortcutsModule(mainWindow),
    new SleepBlockerModule(mainWindow),
    new MprisModule(mainWindow)
  ).catch(console.error);
});
