import { ClientConfig, OAuthLoginConfig } from 'node-kakao';

export const CLIENT: Partial<ClientConfig> = {
  version: '3.2.7',
  appVersion: '3.2.7.2782',
};

export const OAUTH_CLIENT: Partial<OAuthLoginConfig> = {
  loginTokenSeedList: ['KEPHA', 'HALEY'],
};

export default {
  CLIENT,
  OAUTH_CLIENT,
};
