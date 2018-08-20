/**
 * Module in charge of the Tray
 */

import * as os from 'os';
import * as path from 'path';
import { Tray, Menu, app, ipcMain, nativeImage } from 'electron';

import ModuleWindow from './module-window';
import { TrackModel, PlayerStatus } from '../../shared/types/interfaces';

class TrayModule extends ModuleWindow {
  // Darwin used to be supported, it is now disabled because its usage do not
  // make a lot of sense on this platform, as the icon always stay in the dock
  //
  // 01/04/2018 actually not for now, I do not want to break a feature in a
  // patch release
  // this.platforms = ['win32', 'linux'];

  protected tray: Electron.Tray | null;
  protected trayIcon: Electron.NativeImage;
  protected playToggle: Electron.MenuItemConstructorOptions[];
  protected pauseToggle: Electron.MenuItemConstructorOptions[];
  protected songDetails: Electron.MenuItemConstructorOptions[];
  protected menu: Electron.MenuItemConstructorOptions[];

  constructor (window: Electron.BrowserWindow) {
    super(window);

    this.tray = null;
    this.playToggle = [];
    this.pauseToggle = [];
    this.songDetails = [];
    this.menu = [];

    // I don't like it, but will do for now
    const logosPath = path.resolve(path.join(__dirname, '../../src/images/logos'));

    const trayIcons = {
      tray: nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.png')).resize({ width: 24, height: 24 }),
      'tray-win32': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.ico')),
      'tray-darwin-dark': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray-dark.png'))
    };

    // Make it "lightable" on macOS
    trayIcons['tray-darwin-dark'].setTemplateImage(true);

    // Pick the right icon for the right platform
    this.trayIcon = trayIcons.tray;

    if (os.platform() === 'win32') this.trayIcon = trayIcons['tray-win32'];
    else if (os.platform() === 'darwin') this.trayIcon = trayIcons['tray-darwin-dark'];
  }

  load () {
    this.tray = null;

    this.songDetails = [
      {
        label: 'Not playing',
        enabled: false
      },
      {
        type: 'separator'
      }
    ];

    this.playToggle = [
      {
        label: 'Play',
        click: () => {
          this.window.webContents.send('playback:play');
        }
      }
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send('playback:pause');
        }
      }
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send('playback:previous');
        }
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send('playback:next');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Show',
        click: () => {
          this.window.show();
          this.window.focus();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
          this.window.destroy();
        }
      }
    ];

    // Load events listener for player actions
    ipcMain.on('playback:play', () => {
      this.setContextMenu(PlayerStatus.PLAY);
    });

    ipcMain.on('playback:pause', () => {
      this.setContextMenu(PlayerStatus.PAUSE);
    });

    ipcMain.on('playback:trackChange', (_e: Event, track: TrackModel) => {
      this.updateTrayMetadata(track);
      this.setContextMenu(PlayerStatus.PLAY);
    });

    this.show();
  }

  show () {
    this.tray = new Tray(this.trayIcon);
    this.tray.setToolTip('Museeks');

    if (os.platform() === 'win32') {
      this.tray.on('click', () => {
        this.window.show();
        this.window.focus();
      });
    } else if (os.platform() === 'darwin') {
      this.tray.on('double-click', () => {
        this.window.show();
        this.window.focus();
      });
    }

    this.setContextMenu(PlayerStatus.PAUSE);
  }

  setContextMenu (state: PlayerStatus) {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];

    if (this.tray) {
      this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    }
  }

  updateTrayMetadata (track: TrackModel) {
    this.songDetails = [
      {
        label: `${track.title}`,
        enabled: false
      },
      {
        label: `by ${track.artist}`,
        enabled: false
      },
      {
        label: `on ${track.album}`,
        enabled: false
      },
      {
        type: 'separator'
      }
    ];
  }
}

export default TrayModule;
