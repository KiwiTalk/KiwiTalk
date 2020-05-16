export interface AccountSettings {
  available: number,
  available2: number,
  friendsPollingInterval: number,
  settingsPollingInterval: number,
  profilePollingInterval: number,
  moreListPollingInterval: number,
  morePayPollingInterval: number,
  daumMediaPollingInterval: number,
  lessSettingsPollingInterval: number,
  moreApps: {
    recommend: [],
    all: []
  },
  since: number,
  seasonProfileRev: number,
  seasonNoticeRev: number,
  openChat: {
    chatMemberMaxJoin: number,
    chatRoomMaxJoin: number,
    createLinkLimit: number,
    createCardLinkLimit: number,
    numOfStaffLimit: number,
    rewritable: boolean,
    handoverEnabled: boolean
  },
  notificationSettings: {
    subscription: {
      default: {
        item: string,
        name: string,
        value: number
      }[],
      extra: {
        item: string,
        name: string,
        value: number
      }[]
    }
  },
  clientConf: {
    osVersion: string
  },
  contentTab: string,
  emoticonWebstore: {
    'x1.25ImageUrl': string,
    x2ImageUrl: string,
    'x1.5ImageUrl': string,
    targetUrl: string,
    x1ImageUrl: string
  },
  profileSettings: {
    useProfileHistoryShare: boolean,
    useProfilecon: boolean
  },
  agreeAdidTerms: boolean,
  sharpTabBadge: {
    revision: number,
    from: number,
    to: number
  },
  globalTabBanner: {
    revision: number,
    from: number,
    to: number
  },
  mmsBanner: {
    data: {
      number: string[],
      from: number,
      to: number,
      appScheme: string,
      webScheme: string,
      text: string,
      browser: string
    }[],
    revision: number
  },
  emoticonStoreBadge: number,
  featureFlags: [],
  chatRoomDecorationSetting: {
    revision: number
  },
  status: number,
  serviceUserId: number,
  settingsStatus: number,
  recentVersion: string,
  statusMessage: string,
  nickName: string,
  profileImageUrl: string,
  fullProfileImageUrl: string,
  originalProfileImageUrl: string,
  uuid: string,
  uuidSearchable: boolean,
  contactNameSync: number,
  locoConfRevision: number,
  server_time: number,
  pstnNumber: string,
  formattedPstnNumber: string,
  nsnNumber: string,
  formattedNsnNumber: string,
  allowMigration: boolean,
  shortcuts: [
    {
      profile: number
    },
    {
      itemstore: number
    },
    {
      notice: number
    },
    {
      gamecenter: number
    },
    {
      pluscalendar: number
    }
  ],
  accountId: number,
  accountDisplayId: string,
  hashedAccountId: string,
  emailStatus: number,
  emailAddress: string,
  emailVerified: boolean
}