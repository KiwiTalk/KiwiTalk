import UtilModules from '../utils';
import ChatModule from '../chat-utils';
import Strings from './Strings';

export const LoginErrorReason: Record<number, string> = {
  '-9797': Strings.Error.SERVER_CHECKING,
  '-999': Strings.Error.OLD_CLIENT,
  '-998': Strings.Error.REQUIRE_AUTHORIZATION,
  '-997': Strings.Error.BLOCK_ACCOUNT,
  '-950': Strings.Error.INVALID_ACCESS_TOKEN,
  '-910': Strings.Error.INVALID_LOGIN_TOKEN,
  '-500': Strings.Error.UNKNOWN,
  '-402': Strings.Error.BLOCK_USER_INTERACTION,
  '-401': Strings.Error.INVALID_CHATROOM,
  '-301': 'INTERNAL_SERVER_ERROR_BO',
  '-300': 'INTERNAL_SERVER_ERROR_CARRIAGE',
  '-203': Strings.Error.INVALID_PARAM,
  '-202': Strings.Error.INVALID_METHOD,
  '-201': Strings.Error.LOGOUTED_REQUEST,
  '-112': Strings.Error.TOO_MANY_REQUEST,
  '-111': Strings.Error.INVALID_PASSCODE,
  '-110': Strings.Error.NOT_ENCODED,
  '-102': Strings.Error.MAXIMUM_DEVICE,
  '-101': Strings.Error.ANOTHER_LOGON,
  '-100': Strings.Error.UNAUTHORIZED_DEVICE,
  '-1': Strings.Error.INVALID_USER,
  '30': Strings.Error.INVALID_FIELD,
  '32': Strings.Error.NOT_EXIST_ACCOUNT,
  '500': Strings.Error.SERVER_ERROR,
};

export default {
  UtilModules,
  ChatModule,
  LoginErrorReason,
};
