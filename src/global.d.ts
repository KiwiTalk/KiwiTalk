const loginObject = require('../public/login')
const utilObject = require('../public/utils')
const chatObject = require('../public/chat')

type LoginOption = {
  saveEmail: boolean
  autoLogin: boolean
  force?: boolean
}

declare namespace nw {
  var global: {
    talkClient: import('node-kakao').TalkClient
    login: typeof loginObject & { login(
      client: TalkClient,
      email: string,
      password: string,
      { saveEmail, autoLogin, force }: LoginOption
    ), data: {
      email: string,
      password: string,
      saveEmail: boolean,
      autoLogin: boolean,
      force: boolean
    } }
    util: typeof utilObject
    chat: typeof chatObject
  }
  var process: NodeJS.Process
}
