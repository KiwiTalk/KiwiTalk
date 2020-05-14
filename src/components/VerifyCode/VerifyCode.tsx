import React from 'react';
import styled from 'styled-components';

const VerifyCode = () => {
  return (
    <div>
      <form>
        <input placeholder={'인증 번호를 입력해주세요.'}/>
        <button>인증하기</button>
      </form>
    </div>
  )
};

export default VerifyCode;