import {BrowserWindow, ipcMain, app} from "electron";
import isDev from 'electron-is-dev';
import * as path from 'path';

export default class WindowManager {
  static windowList: BrowserWindow[] = [];

  private static initOpenWindowChannel() {
    ipcMain.on('open_window', (event, url: string) => {
      this.addWindow(url);
    });
  }

  static addFirstWindow(url = '') {
    if (this.windowList[0] == null) {
      this.initOpenWindowChannel();
      const newWindow = this.addWindow(url, false);
      this.windowList[0] = newWindow;
    }
  }

  static addWindow(url = '', pushToList = true) {
    const newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      frame: false,
    });

    if (isDev) {
      newWindow.loadURL(`http://localhost:3000#${url}`);
      newWindow.webContents.openDevTools();
    } else {
      newWindow.loadFile(path.join(app.getAppPath(), '../build/index.html') + `#${url}`);
    }

    newWindow.on('closed', () => {
      this.removeWindow(newWindow);
    })

    if (pushToList) this.windowList.push(newWindow);
    
    return newWindow;
  }

  static removeWindow(browserWindow: BrowserWindow) {
    this.windowList.splice(this.windowList.indexOf(browserWindow), 1);
  }

  static sendMessage(channel: string, ...args: any[]) {
    this.windowList.forEach((browserWindow) => {
      browserWindow.webContents.send(channel, ...args);
    });
  }
}