export const Common = {
  OK: '확인',
  CLOSE: '닫기',
};

export const Auth = {
  LOGIN: '로그인',
  LOGOUT: '로그아웃',
  PASSWORD: '비밀번호',

  LOGIN_MESSAGE: '로그인 되었습니다.',
  LOGOUT_MESSAGE: '로그아웃 되었습니다.',

  FORCE_LOGIN: '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',

  REASON: '이유: ',

  WRITE_PASSCODE: '인증 번호를 입력해주세요.',

  DEVICE_REGISTRATION_FAILED: '기기를 등록하지 못하였습니다.',
  LOGIN_FAILED: '로그인 할 수 없습니다',
  AUTO_LOGIN_FAILED: '자동 로그인 할 수 없습니다',
  NO_TOKEN: '자동로그인에 필요한 데이터를 찾을 수 없습니다.',

  KAKAO_ACCOUNT: '카카오계정 (이메일 또는 전화번호)',
  SAVE_ID: '아이디 저장',
  USE_AUTO_LOGIN: '자동 로그인 사용하기',

  Result: {
    SUCCESS: '성공',
    NEED_PASSCODE: '인증번호가 필요합니다.',
    ANOTHER_DEVICE: '다른 기기에 이미 로그인 되어있습니다.',
    RESTRICT: '제한된 계정입니다.',
    WRONG: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
} as const;

export const Error = {
  UNKNOWN: '알 수 없는 오류',
  SERVER_CHECKING: '서버 점검 중입니다.',
  OLD_CLIENT: '클라이언트 버전이 너무 낮습니다',
  REQUIRE_AUTHORIZATION: '인증이 필요합니다',
  BLOCK_ACCOUNT: '계정이 차단되었습니다.',
  INVALID_ACCESS_TOKEN: '엑세스 토큰이 올바르지 않습니다.',
  INVALID_LOGIN_TOKEN: '로그인 토큰이 올바르지 않습니다.',
  BLOCK_USER_INTERACTION: '차단된 친구에게 메시지를 전송을 시도하였습니다',
  INVALID_CHATROOM: '채팅방이 존재하지 않습니다.',
  INVALID_PARAM: 'Parameter가 올바르지 않습니다.',
  INVALID_METHOD: 'Method가 올바르지 않습니다.',
  LOGOUTED_REQUEST: '로그아웃 된 계정에서 요청하였습니다.',
  TOO_MANY_REQUEST: '인증 시도 횟수를 초과하였습니다.',
  INVALID_PASSCODE: '인증 번호가 맞지 않습니다',
  NOT_ENCODED: 'UUID가 Base64로 인코딩 되어있지 않습니다.',
  MAXIMUM_DEVICE: '인증 가능한 기기 갯수를 초과하였습니다.\n총 인증 가능한 기기는 5대 입니다.',
  ANOTHER_LOGON: '다른 클라이언트가 로그인 중입니다.',
  UNAUTHORIZED_DEVICE: '등록되지 않은 디바이스입니다.',
  INVALID_USER: '올바르지 않은 사용자입니다.',
  INVALID_FIELD: '일부 필드 값이 잘못되었습니다.',
  NOT_EXIST_ACCOUNT: '카카오톡 계정을 찾을 수 없습니다.',
  SERVER_ERROR: 'Internal Error',
} as const;

export default {
  Common,
  Auth,
  Error,
};
