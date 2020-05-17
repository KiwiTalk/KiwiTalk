import {app} from 'electron';
import WindowManager from './src/WindowManager';
import {v4} from "uuid";

// @ts-ignore
global.nodeKakao = require('node-kakao');
// @ts-ignore
global.store = new (require('electron-store'))();
// @ts-ignore
global.getClientName = (): string => {
  // @ts-ignore
  let clientName = global.store.get('client_name') as string;
  if (clientName == null) {
    clientName = require('os').hostname();
    // @ts-ignore
    global.store.set('client_name', clientName);
  }
  return clientName;
}
// @ts-ignore
global.createNewUUID = (): string => {
  return Buffer.from(v4()).toString('base64');
}
// @ts-ignore
global.getUUID = (): string => {
  // @ts-ignore
  let uuid = global.store.get('uuid') as string;
  if (uuid == null) {
    // @ts-ignore
    uuid = global.createNewUUID();
    // @ts-ignore
    global.store.set('uuid', uuid);
  }
  return uuid;
}

// @ts-ignore
global.talkClient = new global.nodeKakao.TalkClient(global.getClientName());
// @ts-ignore
console.log(global.talkClient);

app.whenReady().then(() => {
  WindowManager.init();
  WindowManager.addFirstWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => WindowManager.addFirstWindow());

app.requestSingleInstanceLock();
