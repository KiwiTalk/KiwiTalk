import React, {useState} from 'react';
import styled from 'styled-components';
import IconProfiles from '../../../assets/images/icon_profiles.svg';
import IconChats from '../../../assets/images/icon_chats.svg';
import IconProfilesDisabled from '../../../assets/images/icon_profiles_disabled.svg';
import IconChatsDisabled from '../../../assets/images/icon_chats_disabled.svg';
import IconButton from '../icon-button';
import color from '../../../assets/colors/theme';

const Wrapper = styled.div`
  width: 64px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${color.GREY_750};
  padding: 16px;
  box-sizing: border-box;
`;

export enum SideBarChangeType {
    PROFILES = 0,
    CHATS = 1
}

interface SideBarProps {
    onChange?: (type: SideBarChangeType) => any;
}

const SideBar: React.FC<SideBarProps> = ({onChange}) => {
    const [type, setType] = useState<SideBarChangeType>(0);
    return (
        <Wrapper>
            <IconButton onClick={() => {
                setType(SideBarChangeType.PROFILES);
                console.log('profile click')
                onChange && onChange(SideBarChangeType.PROFILES);
            }} background={type === SideBarChangeType.PROFILES ? IconProfiles : IconProfilesDisabled}
                        style={{width: '32px', height: '32px', marginBottom: '32px'}}/>
            <IconButton onClick={() => {
                setType(SideBarChangeType.CHATS);
                onChange && onChange(SideBarChangeType.CHATS);
            }} background={type === SideBarChangeType.CHATS ? IconChats : IconChatsDisabled}
                        style={{width: '32px', height: '32px'}}/>
        </Wrapper>
    );
};

export default SideBar;
