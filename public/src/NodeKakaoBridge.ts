import {TalkClient, KakaoAPI, LocoKickoutType, ChatChannel, ClientChatUser, Chat, ChatUser, ChatFeed, ChannelInfo} from 'node-kakao';
import {ChatChannel as PureChatChannel} from './NodeKakaoPureObject';
import {v4} from 'uuid';
import {ipcMain} from 'electron';
import Store from 'electron-store';
import os from 'os';
import WindowManager from './WindowManager'
import Utils from './Utils'

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
    // @ts-ignore
    ipcMain.on('channel_list', (event, ...args) => this.ChannelListChannelEvent(event, ...args));

    this.client.on('disconnected', (reason) => this.onDisconnected(reason));
    this.client.on('join_channel', (joinChannel) => this.onJoinChannel(joinChannel));
    this.client.on('left_channel', (leftChannel) => this.onLeftChannel(leftChannel));
    this.client.on('login', (user) => this.onLogin(user));
    this.client.on('message', (chat) => this.onMessage(chat));
    this.client.on('message_read', (channel, reader, watermark) => this.onMessageRead(channel, reader, watermark));
    this.client.on('user_join', (channel, user, feed) => this.onUserJoin(channel, user, feed));
    this.client.on('user_left', (channel, user, feed) => this.onUserLeft(channel, user, feed));
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

  private static async ChannelListChannelEvent(event: Electron.IpcMainEvent) {
    const channelList = this.client.ChannelManager.getChannelList()
    const pureChannelList = Utils.toPureJS(channelList) as PureChatChannel[];
    await Promise.all(pureChannelList.map(async (pureChannel, index) => {
      if (pureChannel.channelInfo.name === '' || pureChannel.channelInfo.roomImageURL === '') {
        const channelInfo = await channelList[index].getChannelInfo();
        const userInfoListUpToFive = channelInfo.UserIdList.filter((userId, index) => index < 5).map((userId) => channelInfo.getUserInfoId(userId));
        if (pureChannel.channelInfo.name === '') pureChannel.channelInfo.name = userInfoListUpToFive.map((userInfo) => userInfo.User.Nickname).join(', ');
        if (pureChannel.channelInfo.roomImageURL === '') pureChannel.channelInfo.roomImageURL = userInfoListUpToFive[0].ProfileImageURL;
      }
    }));
    event.sender.send('channel_list', pureChannelList.reverse())
  }

  private static async onDisconnected(reason: LocoKickoutType) {

  }

  private static async onJoinChannel(joinChannel: ChatChannel) {

  }

  private static async onLeftChannel(leftChannel: ChatChannel) {

  }

  private static async onLogin(user: ClientChatUser) {

  }

  private static async onMessage(chat: Chat) {
    WindowManager.sendMessage('chat', Utils.toPureJS(chat))
  }

  private static async onMessageRead(channel: ChatChannel, reader: ChatUser, watermark: any) {

  }

  private static async onUserJoin(channel: ChatChannel, user: ChatUser, feed: ChatFeed) {

  }

  private static async onUserLeft(channel: ChatChannel, user: ChatUser, feed: ChatFeed) {

  }
}
