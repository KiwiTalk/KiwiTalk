// eslint-disable-next-line @typescript-eslint/no-var-requires
const loginObject = require('../public/login');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utilObject = require('../public/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chatObject = require('../public/chat');

type LoginOption = {
  saveEmail: boolean
  autoLogin: boolean
  force?: boolean
};

declare module '*.svg' {
  const content: any;
  export default content;
}

declare namespace nw {
  const global: {
    talkClient: import('node-kakao').TalkClient
    login: typeof loginObject & {
      login(
          client: import('node-kakao').TalkClient,
          email: string,
          password: string,
          {saveEmail, autoLogin, force}: LoginOption
      ), data: {
        email: string,
        password: string,
        saveEmail: boolean,
        autoLogin: boolean,
        force: boolean
      }
    }
    util: typeof utilObject
    chat: typeof chatObject
  };
  const process: NodeJS.Process;
}
