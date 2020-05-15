import React from 'react';
import styled from 'styled-components';
import ProfileDefault from '../../assets/images/profile_default.svg'
import IconSettings from '../../assets/images/icon_settings.svg';
import IconButton from './IconButton';
import { ClientChatUser } from '../../../public/src/NodeKakaoPureObject';
import ProfileImage from './ProfileImage';

const Wrapper = styled.div`
  width: 309px;
  height: 89px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #F7F7F7;
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const Username = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  color: #000000;
`;

const UserEmail = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 10px;
  color: #808080;
`;

interface ProfileProps {
  clientUser?: ClientChatUser
}

const Profile: React.FC<ProfileProps> = ({clientUser}) => {
  if (!clientUser) {
    return (
      <Wrapper>
        <IconButton background={IconSettings} style={{ width: '24px', height: '24px' }}/>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <ProfileImage src={clientUser.mainUserInfo.settings.ProfileImageURL || ProfileDefault} style={{ width: '36px', height: '36px', marginLeft: '25px', marginRight: '16px' }} focus={true} />
      <UserInfoWrapper>
        <Username>{clientUser.nickname}</Username>
        <UserEmail>{clientUser.mainUserInfo.clientAccessData.DisplayAccountId}</UserEmail>
      </UserInfoWrapper>
      <IconButton background={IconSettings} style={{ width: '24px', height: '24px', marginRight: '32px' }}/>
    </Wrapper>
  );
};

export default Profile;
