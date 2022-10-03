export type LoginAccessData = {
  userId: number,
  countryIso: string,
  countryCode: string,

  accountId: number,

  serverTime: number,
  storyUrl: string,

  accessToken: string,
  refreshToken: string,
  tokenType: string,

  autoLoginAccountId: string,
  displayAccountId: string,

  mainDeviceAgentName: string,
  mainDeviceAppVersion: string,
}

export type TalkResponseStatus<T = void> = {
  status: number,
} | {
  status: 0
} & T


