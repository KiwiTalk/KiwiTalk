import React, { useContext, useState } from "react";
import Color from '../../assets/colors/theme';
import styled from "styled-components";
import { AppContext } from "../../app";
import { Button } from "../common/button";
import { LoginFormData } from "../../pages/login";
import VerifyCodeForm from "./verify-code-form";

export enum RegisterType {

  ONCE,
  PERMANENT

}

const SelectionWrapper = styled.div`
  width: 280px;
`;

const Wrapper = styled.div`
  width: 280px;
  box-sizing: border-box;
`;

const PreviousLink = styled.a`
  font-family: NanumBarunGothic;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  width: 280px;
  display: block;
  align-items: center;
  text-align: center;
  color: rgba(77, 80, 97, 1);
  text-decoration: none;
  margin-top: 16px;
  user-select: none;
`;


export const DeviceRegistration = (
  args: {formData: LoginFormData, onRegister: (permanent: boolean) => void, goPrevious: () => void}
  ): JSX.Element => {
  const {formData, onRegister, goPrevious} = args;
  
  const [registerType, setRegisterType] = useState(null) as
    [RegisterType | null, React.Dispatch<React.SetStateAction<RegisterType | null>>];

  let client = useContext(AppContext).client;

  let defaultForm = <SelectionWrapper>
  <Button onClick={() => setRegisterType(RegisterType.PERMANENT)}>내 PC 인증 받기</Button>
  <Button onClick={() => setRegisterType(RegisterType.ONCE)}>1회용 인증 받기</Button>
  </SelectionWrapper>;

  let form;
  if (registerType === null) {
    form = defaultForm;
  } else {
    client.Auth.requestPasscode(formData.email, formData.password, true);

    let registerDevice = (permanent: boolean, passcode: string) => {
      client.Auth.registerDevice(passcode, formData.email, formData.password, permanent, true)
      .then((struct) => {
        if (struct.status !== 0) {
          throw new Error(`${struct.status} : ${(struct as any).message || ''}`);
        }

        onRegister(permanent);
      })
      .catch((err) => {
        alert(`기기 등록 실패 : ${err}`);
      });
    }

    switch (registerType) {

      case RegisterType.PERMANENT: {
        form = <VerifyCodeForm onSubmit={(passcode) => registerDevice(true, passcode)} />;
        break;
      }
  
      case RegisterType.ONCE: {
        form = <VerifyCodeForm onSubmit={(passcode) => registerDevice(false, passcode)} />;
        break;
      }
  
      default: {
        form = defaultForm;
        setRegisterType(null);
        break;
      }
    }
  }

  return <Wrapper>
    {form}
    <PreviousLink onClick={goPrevious}>처음으로 돌아가기</PreviousLink>
  </Wrapper>
}