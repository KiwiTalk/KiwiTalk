import localforage from 'localforage';
import {v4} from 'uuid';

// @ts-ignore
global.getClientName = async (): Promise<string> => {
  try {
    return await localforage.getItem('client_name');
  } catch (e) {
    let clientName = require('os').hostname();
    localforage.setItem('client_name', clientName)
        .catch((error) => {
          console.log(error);
        });
    return clientName;
  }
}
// @ts-ignore
global.createNewUUID = (): string => {
  return Buffer.from(v4()).toString('base64');
}
// @ts-ignore
global.getUUID = async (): Promise<string> => {
  try {
    return await localforage.getItem('uuid');
  } catch (e) {
    // @ts-ignore
    let uuid = global.createNewUUID();
    localforage.setItem('uuid', uuid)
        .catch((error) => {
          console.log(error);
        });
    return uuid;
  }
}

// @ts-ignore
global.talkClient = new require('node-kakao').TalkClient(global.getClientName());

nw.Window.open('index.html', {}, (win) => {
  if (win) {
    win.width = 800;
    win.height = 600;
  }
});
