import { Chat, ChatChannel, ChatUser, Long, TalkClient } from 'node-kakao';
import { PacketSyncMessageReq, PacketSyncMessageRes } from 'node-kakao/dist/packet/packet-sync-message';

/* eslint-disable no-unused-vars */
enum ChannelEventType {
  ADD
}

enum ChatEventType {
  ADD
}

/* eslint-enable no-unused-vars */

type ChannelEvent = (type: ChannelEventType, channel: ChatChannel) => void;
type ChatEvent = (type: ChatEventType, chat: Chat, channel: ChatChannel) => void;

export default class KakaoManager {
  static channelList: ChatChannel[] = [];
  static chatList: Map<string, Chat[]> = new Map();

  private static isInit: boolean = false;
  private static client: TalkClient;

  private static channelEvents: ChannelEvent[];
  private static chatEvents: ChatEvent[];

  static async init(client: TalkClient): Promise<void> {
    if (this.isInit) return;

    this.client = client;

    this.channelList = this.client.ChannelManager.getChannelList();
    for (const channel of this.channelList) {
      await this.initChat(channel.Id);
    }

    this.client.on('message', (chat: Chat) => {
      const channelId = chat.Channel.Id.toString();
      const chatList = this.chatList.get(channelId);

      chatList?.push(chat);
    });

    this.client.on('user_join', (_, user: ChatUser) => {
      if (user.isClientUser()) {
        const newChannelList = this.client.ChannelManager.getChannelList();
        const addedChannels = newChannelList.filter(
            ({ Id }) => this.channelList.every(({ Id: oldId }) => Id.notEquals(oldId)),
        );

        for (const channel of addedChannels) {
          this.initChat(channel.Id);
        }

        this.channelList = newChannelList;
      }
    });

    this.client.on('user_left', (_, user: ChatUser) => {
      if (user.isClientUser()) {
        const newChannelList = this.client.ChannelManager.getChannelList();
        const removedChannels = this.channelList.filter(
            ({ Id }) => newChannelList.every(({ Id: newId }) => Id.notEquals(newId)),
        );

        for (const channel of removedChannels) {
          this.chatList.set(channel.Id.toString(), []);
        }
      }
    });

    this.isInit = true;
  }

  static async initChat(channelId: Long): Promise<void> {
    const { LastTokenId: lastTokenId } = (
      await this.client.NetworkManager.requestPacketRes<PacketSyncMessageRes>(
          new PacketSyncMessageReq(
              channelId,
              Long.fromInt(1), 1, Long.fromInt(2),
          ),
      )
    );

    const pk = await this.client
        .NetworkManager
        .requestPacketRes<PacketSyncMessageRes>(
            new PacketSyncMessageReq(
                channelId,
                Long.fromInt(1),
                1,
                lastTokenId,
            ),
        );

    if (pk.ChatList.length < 1) return;
    let startId = pk.ChatList[0].prevLogId;
    const update: Chat[] = [];
    let chatLog: Chat[] | null | undefined;

    while (
      (
        chatLog = (
          await this.client
              .ChatManager
              .getChatListFrom(
                  channelId,
                  startId,
              )
        ).result
      ) && chatLog.length > 0) {
      update.push(...chatLog);
      if (startId.notEquals(chatLog[chatLog.length - 1].LogId)) {
        startId = chatLog[chatLog.length - 1].LogId;
      }
    }

    this.chatList.set(channelId.toString(), update);
  }

  static getChannel(id: string): ChatChannel {
    const channel = this.channelList.find(({ Id }) => Id.equals(id));
    if (!channel) throw Error(`${id} is not found`);

    return channel;
  }
}

/*


  useEffect(() => {
    channelList.forEach(async (channel, index) => {
      if (index !== selectedChannel) return;
      if (records[index]) return;

      console.log(channel.Id.toString());
      const { LastTokenId: lastTokenId } = (
        await client.NetworkManager.requestPacketRes<PacketSyncMessageRes>(
            new PacketSyncMessageReq(
                channel.Id,
                Long.fromInt(1), 1, Long.fromInt(2),
            ),
        )
      );

      const pk = await client
          .NetworkManager
          .requestPacketRes<PacketSyncMessageRes>(
              new PacketSyncMessageReq(
                  channel.Id,
                  Long.fromInt(1),
                  1,
                  lastTokenId,
              ),
          );

      if (pk.ChatList.length < 1) return;
      let startId = pk.ChatList[0].prevLogId;
      const update: ChatObject[] = [];
      let chatLog: ChatObject[] | null | undefined;

      while (
        (
          chatLog = (
            await client
                .ChatManager
                .getChatListFrom(
                    channel.Id,
                    startId,
                )
          ).result
        ) && chatLog.length > 0) {
        update.push(...chatLog);
        if (
          startId.notEquals(chatLog[chatLog.length - 1].LogId)
        ) {
          startId = chatLog[chatLog.length - 1].LogId;
        }
      }
      setChatList((prev) => [...prev, ...update]);

      records[index] = true;
    });
  }, [selectedChannel]);

*/
