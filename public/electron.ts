import {app, BrowserWindow} from 'electron';
import WindowManager from './src/WindowManager'
import NodeKakaoBridge from './src/NodeKakaoBridge'

app.whenReady().then(() => {
  WindowManager.addFirstWindow();
  NodeKakaoBridge.initTalkClient();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => WindowManager.addFirstWindow());