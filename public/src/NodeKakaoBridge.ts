import { Chat, ChatChannel, ChatFeed, ChatUser, ClientChatUser, KakaoAPI, LocoKickoutType, TalkClient } from 'node-kakao';
import { Chat as PureChat, ChatChannel as PureChatChannel } from '../../src/models/NodeKakaoPureObject';
import { v4 } from 'uuid';
import { ipcMain } from 'electron';
import * as os from 'os';
import WindowManager from './WindowManager'
import Utils from './Utils'
import { AccountSettings } from '../../src/models/NodeKakaoExtraObject'

const store = new (require('electron-store'))();

interface AccountData {
  email: string
  password: string
  permanent: boolean
}

export default class NodeKakaoBridge {
  static client: TalkClient
  private static accountData: AccountData = { email: '', password: '', permanent: false }

  static createNewUUID () {
    return Buffer.from(v4()).toString('base64');
  }

  static getUUID () {
    let uuid = store.get('uuid') as string;
    if (uuid == null) {
      uuid = this.createNewUUID();
      store.set('uuid', uuid);
    }
    return uuid;
  }

  static getClientName () {
    let clientName = store.get('client_name') as string;
    if (clientName == null) {
      clientName = os.hostname();
      store.set('client_name', clientName);
    }
    return clientName;
  }

  static initTalkClient () {
    const clientName = this.getClientName();
    this.client = new TalkClient(clientName);

    // @ts-ignore
    ipcMain.on('login', (event, ...args) => this.loginChannelEvent(event, ...args));
    // @ts-ignore
    ipcMain.on('passcode', (event, ...args) => this.passcodeChannelEvent(event, ...args));
    // @ts-ignore
    ipcMain.on('channel_list', (event, ...args) => this.ChannelListChannelEvent(event, ...args));
    // @ts-ignore
    ipcMain.on('account_settings', (event, ...args) => this.AccountSettingsChannelEvent(event, ...args));
    // @ts-ignore
    ipcMain.on('message', (event, ...args) => this.messageChannelEvent(event, ...args));

    this.client.on('disconnected', (reason) => this.onDisconnected(reason));
    this.client.on('join_channel', (joinChannel) => this.onJoinChannel(joinChannel));
    this.client.on('left_channel', (leftChannel) => this.onLeftChannel(leftChannel));
    this.client.on('login', (user) => this.onLogin(user));
    this.client.on('message', (chat) => this.onMessage(chat));
    this.client.on('message_read', (channel, reader, watermark) => this.onMessageRead(channel, reader, watermark));
    this.client.on('user_join', (channel, user, feed) => this.onUserJoin(channel, user, feed));
    this.client.on('user_left', (channel, user, feed) => this.onUserLeft(channel, user, feed));
  }

  private static async loginChannelEvent (event: Electron.IpcMainEvent, email: string = this.accountData.email, password: string = this.accountData.password, permanent: boolean = this.accountData.permanent) {
    try {
      await this.client.login(email, password, this.getUUID());
      event.sender.send('login', { result: 'success' });
    } catch (e) {
      switch (e) {
        case -100: // 인증 필요
          KakaoAPI.requestPasscode(email, password, this.getUUID(), this.client.Name, permanent);
          this.accountData.email = email;
          this.accountData.password = password;
          this.accountData.permanent = permanent;
          event.sender.send('login', {
            result: 'passcode'
          });
          break;
        case -101:
          event.sender.send('login', {
            result: 'anotherdevice'
          });
          break;
        case -997:
          event.sender.send('login', {
            result: 'restricted'
          });
          break;
        case 12:
          event.sender.send('login', {
            result: 'wrong'
          });
          break;
        default:
          event.sender.send('login', {
            result: 'error',
            errorCode: e
          });
          break;
      }
    }
  }

  private static async passcodeChannelEvent (event: Electron.IpcMainEvent, passcode: string) {
    try {
      const res = JSON.parse(await KakaoAPI.registerDevice(passcode, this.accountData.email, this.accountData.password, this.getUUID(), this.client.Name, this.accountData.permanent));
      switch (res.status) {
        case -112: // 입력불가
          event.sender.send('passcode', {
            result: 'unavailable'
          });
          break;
        case -111: // 틀림
          event.sender.send('passcode', {
            result: 'wrong'
          });
          break;
        case 0: // 정답
          event.sender.send('passcode', {
            result: 'success'
          });
          break;
        default:
          event.sender.send('passcode', {
            result: 'error',
            error: JSON.stringify(res)
          });
          break;
      }
    } catch (e) {
      event.sender.send('passcode', {
        result: 'error',
        error: e
      });
    }
  }

  private static async ChannelListChannelEvent (event: Electron.IpcMainEvent) {
    const channelList = this.client.ChannelManager.getChannelList()
    const pureChannelList = Utils.toPureJS(channelList) as PureChatChannel[];
    await Promise.all(pureChannelList.map(async (pureChannel, index) => {
      if (pureChannel.channelInfo.name === '' || pureChannel.channelInfo.roomImageURL === '') {
        const channelInfo = await channelList[index].getChannelInfo();
        const userInfoListUpToFive = channelInfo.UserIdList.filter((userId, index) => index < 5).map((userId) => channelInfo.getUserInfoId(userId));
        channelInfo.Name ? pureChannel.channelInfo.name = channelInfo.Name : pureChannel.channelInfo.name = userInfoListUpToFive.map((userInfo) => {
          return userInfo != null ? userInfo.User.Nickname : "";
        }).join(', ');
        channelInfo.RoomImageURL ? pureChannel.channelInfo.roomImageURL = channelInfo.RoomImageURL : pureChannel.channelInfo.roomImageURL = ((userInfoList) => {
          return userInfoList != null ? userInfoList.ProfileImageURL : "";
        })(userInfoListUpToFive[0]);
        pureChannel.channelInfo.userInfoMap = {};
        channelInfo.UserIdList.forEach((id) => {
          pureChannel.channelInfo.userInfoMap[id.low.toString()] = Utils.toPureJS(channelInfo.getUserInfoId(id));
        })
      }
    }));
    event.sender.send('channel_list', pureChannelList.reverse())
  }

  private static async AccountSettingsChannelEvent (event: Electron.IpcMainEvent) {
    //@ts-ignore
    const accessToken: string = this.client.ClientUser.MainUserInfo.clientAccessData.AccessToken;
    const accountSettings = JSON.parse(await KakaoAPI.requestAccountSettings(accessToken, this.getUUID())) as AccountSettings;
    event.sender.send('account_settings', accountSettings);
  }

  private static async messageChannelEvent (event: Electron.IpcMainEvent, channelId: { high: Number, low: Number }, message: string) { // 추후 바꿔야함
    const channelList: ChatChannel[] = this.client.ChannelManager.getChannelList();

    let target: ChatChannel = null
    for await (const channel of channelList) {
      if (channel.Id.low === channelId.low) {
        target = channel

        break
      }
    }

    const chat = await target.sendText(message)
    this.onMessage(chat)
  }

  private static async onDisconnected (reason: LocoKickoutType) {

  }

  private static async onJoinChannel (joinChannel: ChatChannel) {

  }

  private static async onLeftChannel (leftChannel: ChatChannel) {

  }

  private static async onLogin (user: ClientChatUser) {

  }

  private static async onMessage (chat: Chat) {
    const pureChat: PureChat = Utils.toPureJS(chat);
    pureChat.type = chat.Type;
    WindowManager.sendMessage('chat', pureChat)
  }

  private static async onMessageRead (channel: ChatChannel, reader: ChatUser, watermark: any) {

  }

  private static async onUserJoin (channel: ChatChannel, user: ChatUser, feed: ChatFeed) {

  }

  private static async onUserLeft (channel: ChatChannel, user: ChatUser, feed: ChatFeed) {

  }
}
