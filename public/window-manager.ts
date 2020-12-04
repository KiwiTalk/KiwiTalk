import {app, BrowserWindow, ipcMain} from 'electron';
import isDev from 'electron-is-dev';
import * as path from 'path';
import * as URL from 'url';

export default class WindowManager {
    static windowList: BrowserWindow[] = [];

    static init(): void {
      this.initOpenWindowChannel();
      app.on('window-all-closed', () => {
        app.quit();
      });
    }

    private static initOpenWindowChannel(): void {
      ipcMain.on('open-window', async (event, url: string) => {
        await this.addWindow(url);
      });
    }

    static async addFirstWindow(url = ''): Promise<void> {
      if (this.windowList[0] == null) {
        this.windowList[0] = await this.addWindow(url, false);
      }
    }

    static async addWindow(
        url = '',
        pushToList = true,
    ): Promise<BrowserWindow> {
      const newWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          webSecurity: false,
        },
        frame: true,
      });

      if (isDev) {
        await newWindow.loadURL(`http://localhost:3000#${url}`);
        newWindow.webContents.openDevTools();
      } else {
        await newWindow.loadURL(URL.format({
          pathname: path.join(app.getAppPath(), './build/index.html'),
          protocol: 'file:',
          slashes: true,
        }));
      }

      newWindow.on('closed', () => {
        this.removeWindow(newWindow);
      });

      if (pushToList) this.windowList.push(newWindow);

      return newWindow;
    }

    static removeWindow(browserWindow: BrowserWindow): void {
      this.windowList.splice(this.windowList.indexOf(browserWindow), 1);
    }

    static sendMessage(channel: string, ...args: any[]): void {
      this.windowList.forEach((browserWindow) => {
        browserWindow.webContents.send(channel, ...args);
      });
    }
}
