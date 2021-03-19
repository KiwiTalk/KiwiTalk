import React from 'react';
import styled from 'styled-components';
import ProfileDefault from '../../assets/images/profile_default.svg';
import IconSettings from '../../assets/images/icon_settings.svg';
import { IconButton } from '@material-ui/core';
import ProfileImage from './ProfileImage';
import color from '../../assets/colors/theme';
import { MoreSettingsStruct } from 'node-kakao';

const Wrapper = styled.div`
  width: 309px;
  height: 64px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${color.GREY_800};
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Username = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  color: ${color.GREY_100};
`;

const UserEmail = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 10px;
  color: ${color.GREY_400};
`;

interface ProfileProps {
    accountSettings?: MoreSettingsStruct
}

const Profile: React.FC<ProfileProps> = ({ accountSettings }) => {
  if (!accountSettings) {
    return (
      <Wrapper>
        <IconButton
          style={{
            width: '36px',
            height: '36px',
          }}>
          <img src={IconSettings} />
        </IconButton>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <ProfileImage src={
        accountSettings.profileImageUrl ?? ProfileDefault
      }
      style={
        {
          width: '36px',
          height: '36px',
          marginLeft: '25px',
          marginRight: '16px',
        }
      }/>
      <UserInfoWrapper>
        <Username>{accountSettings.nickName}</Username>
        <UserEmail>{accountSettings.accountDisplayId}</UserEmail>
      </UserInfoWrapper>
      <IconButton
        style={{
          width: '24px',
          height: '24px',
          marginRight: '16px',
        }}>
        <img src={IconSettings} />
      </IconButton>
    </Wrapper>
  );
};

export default Profile;
