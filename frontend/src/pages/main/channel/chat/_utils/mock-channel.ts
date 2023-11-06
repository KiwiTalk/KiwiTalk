import { ClientChannel, Chatlog, NormalChannelUser } from '@/api/client';

export class MockChannel implements ClientChannel {
  public id = '0';
  public messages: Chatlog[] = Array
    .from({ length: 1000 })
    .map((_, i) => ({
      logId: `${i}`,
      prevLogId: i > 0 ? `${i - 1}` : undefined,

      senderId: `user-${Math.floor(Math.random() * 5)}`,
      sendAt: Date.now(),

      chatType: 1,

      content: 'Test Message'.repeat(Math.floor(Math.random() * 29) + 1),
    }));

  public members = Array.from({ length: 5 })
    .map((_, index) => [`user-${index}`, {
      countryIso: 'ko-KR',
      statusMessage: 'Test Status Message',
      accountId: 'test-account-id',
      linkedServices: 'test-linked-services',
      suspended: false,

      nickname: `User ${index + 1}`,
      profileUrl: `https://picsum.photos/64?s=${Math.random()}`,
      fullProfileUrl: `https://picsum.photos/200?s=${Math.random()}`,
      originalProfileUrl: `https://picsum.photos/500?s=${Math.random()}`,

      watermark: '0',
    }] as [string, NormalChannelUser]);

  async sendText(text: string) {
    return {
      logId: '0',
      prevLogId: undefined,

      senderId: `user-${Math.floor(Math.random() * 5)}`,
      sendAt: Date.now(),

      chatType: 1,

      content: text.repeat(Math.floor(Math.random() * 29) + 1),
    };
  }

  async readChat(logId: string) {
    console.log('readChat', logId);
  }

  async loadChat(count: number): Promise<Chatlog[]> {
    return this.messages.slice(0, count);
  }

  async getUsers() {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 250));
    return this.members;
  }

  async close() {
    console.log('close');
  }
}
