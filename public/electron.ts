import {app, BrowserWindow} from 'electron';
import WindowManager from './src/WindowManager'

app.whenReady().then(() => WindowManager.addFirstWindow())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => WindowManager.addFirstWindow());