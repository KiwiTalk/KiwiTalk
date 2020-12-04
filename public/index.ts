import {app} from 'electron';
import WindowManager from './window-manager';
import login from './login';

app.whenReady().then(async () => {
  WindowManager.init();
  await WindowManager.addFirstWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

(global as any).loginModule = login;
app.on('activate', () => WindowManager.addFirstWindow());

app.requestSingleInstanceLock();
