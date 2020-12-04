// eslint-disable-next-line no-unused-vars
const resultText = {
  success: '로그인 성공',
  passcode: '인증번호 필요',
  anotherdevice: '다른 기기에서 이미 로그인됨',
  restricted: '제한된 계정입니다.',
  wrong: '아이디 또는 비밀번호가 올바르지 않습니다.',
};

// eslint-disable-next-line no-unused-vars
interface LoginResponse {
    result: string
    errorCode?: number
}

// eslint-disable-next-line no-unused-vars
interface PasscodeResponse {
    result: string
    error?: string
}

export const LoginErrorReason = new Map<number, string>();
LoginErrorReason.set(-9797, '서버 점검 중');
LoginErrorReason.set(-999, '클라이언트 버전이 너무 낮음');
LoginErrorReason.set(-998, '인증이 필요함');
LoginErrorReason.set(-997, '계정이 차단됨');
LoginErrorReason.set(-500, '알 수 없는 실패');
LoginErrorReason.set(-402, '차단된 친구에게 메시지 전송 시도');
LoginErrorReason.set(-401, '채팅을 찾을 수 없음');
LoginErrorReason.set(-301, 'INTERNAL_SERVER_ERROR_BO');
LoginErrorReason.set(-300, 'INTERNAL_SERVER_ERROR_CARRIAGE');
LoginErrorReason.set(-203, '올바르지 않은 Parameter');
LoginErrorReason.set(-202, '올바르지 않은 Method');
LoginErrorReason.set(-201, '로그아웃된 계정으로부터 요청 발생');
LoginErrorReason.set(-112, '인증을 너무 많이 요청함');
LoginErrorReason.set(-111, '인증 번호가 틀림');
LoginErrorReason.set(-102, '인증 가능한 기기 개수 초과');
LoginErrorReason.set(-101, '다른 클라이언트가 로그인 중');
LoginErrorReason.set(-100, '등록되지 않은 디바이스');
LoginErrorReason.set(-1, '올바르지 않은 사용자');
LoginErrorReason.set(30, '일부 필드 값이 잘못됨');
LoginErrorReason.set(32, '카카오톡 계정을 찾을 수 없음');
LoginErrorReason.set(500, 'Internal Error');

export default {
  LoginErrorReason,
};
