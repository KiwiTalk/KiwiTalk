import {TalkClient, KakaoAPI} from "node-kakao";
import {v4} from 'uuid';
import {ipcMain} from 'electron';

interface AccountData {
  email?: string
  password?: string
  permanent?: boolean
}

export default class NodeKakaoBridge {
  static client: TalkClient
  private static accountData: AccountData = {}

  static makeDesktopName() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static createNewUUID() {
    return Buffer.from(v4()).toString('base64');
  }

  static getUUID() {
    let uuid = localStorage.getItem('uuid');
    if (uuid == null) {
      uuid = this.createNewUUID();
      localStorage.setItem('uuid', uuid);
    }
    return uuid;
  }

  static getClientName() {
    let clientName = localStorage.getItem('client_name');
    if (clientName == null) {
      clientName = `DESKTOP-${this.makeDesktopName()}`
      localStorage.setItem('client_name', clientName);
    }
    return clientName;
  }

  static initTalkClient() {
    const clientName = this.getClientName();
    this.client = new TalkClient(clientName);

    ipcMain.on('login', this.loginChannelEvent);
    ipcMain.on('passcode', this.passcodeChannelEvent);
  }

  private static async loginChannelEvent(event: Electron.IpcMainEvent, email: string, password: string, permanent: boolean) {
    try {
      await this.client.login(email, password, this.getUUID());
      event.sender.send('asynchronous-reply', { type: 'login', result: 'success' });
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
      event.sender.send('passcode', { result: e });
    }
  }
}