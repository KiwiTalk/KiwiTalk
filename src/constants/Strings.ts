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
  LOGIN_FAILED: '로그인을 할 수 없습니다',

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
};

export const Error = {
  UNDEFINED: '알 수 없는 오류',
};

export default {
  Common,
  Auth,
  Error,
};
