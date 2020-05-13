import {TalkClient, KakaoAPI} from "node-kakao";
import {v4} from 'uuid';
import {ipcMain} from 'electron';
import Store from 'electron-store';
import os from 'os';

const store = new Store();

interface AccountData {
  email: string
  password: string
  permanent: boolean
}

export default class NodeKakaoBridge {
  static client: TalkClient
  private static accountData: AccountData = { email: '', password: '', permanent: false }

  static createNewUUID() {
    return Buffer.from(v4()).toString('base64');
  }

  static getUUID() {
    let uuid = store.get('uuid') as string;
    if (uuid == null) {
      uuid = this.createNewUUID();
      store.set('uuid', uuid);
    }
    return uuid;
  }

  static getClientName() {
    let clientName = store.get('client_name') as string;
    if (clientName == null) {
      clientName = os.hostname();
      store.set('client_name', clientName);
    }
    return clientName;
  }

  static initTalkClient() {
    const clientName = this.getClientName();
    this.client = new TalkClient(clientName);

    // @ts-ignore
    ipcMain.on('login', (event, ...args) => this.loginChannelEvent(event, ...args));
    // @ts-ignore
    ipcMain.on('passcode', (event, ...args) => this.passcodeChannelEvent(event, ...args));
  }

  private static async loginChannelEvent(event: Electron.IpcMainEvent, email: string, password: string, permanent: boolean) {
    try {
      await this.client.login(email, password, this.getUUID());
      event.sender.send('login', { result: 'success' });
    } catch (e) {
      if (e === -100) { // 인증 필요
        KakaoAPI.requestPasscode(email, password, this.getUUID(), this.client.Name, permanent);
        this.accountData.email = email;
        this.accountData.password = password;
        this.accountData.permanent = permanent;
        event.sender.send('login', { result: 'passcode' });
      } else if (e === -101) {
        event.sender.send('login', { result: 'anotherdevice' });
      } else if (e === -997) {
        event.sender.send('login', { result: 'restricted' });
      } else if (e === 12) {
        event.sender.send('login', { result: 'wrong' });
      } else {
        event.sender.send('login', { result: 'error', errorCode: e });
      }
    }
  }

  private static async passcodeChannelEvent(event: Electron.IpcMainEvent, passcode: string) {
    try {
      const res = await KakaoAPI.registerDevice(passcode, this.accountData.email, this.accountData.password, this.getUUID(), this.client.Name, this.accountData.permanent);
      if (res.status === -112) { // 입력불가
        event.sender.send('passcode', { result: 'unavailable' });
      } else {
        event.sender.send('passcode', { result: 'success' });
      }
    } catch (e) {
      event.sender.send('passcode', { result: 'error', error: e });
    }
  }
}