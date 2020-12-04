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
    login: typeof import('../public/login') & {
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
    util: typeof import('../public/utils')
    chat: typeof import('../public/chat')
  };
  const process: NodeJS.Process;
}
