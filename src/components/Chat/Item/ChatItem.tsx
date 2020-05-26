import React, {HTMLAttributes} from 'react';
import styled from 'styled-components';
import ProfileDefault from '../../../assets/images/profile_default.svg'
import ProfileImage, {ProfileImageBackgroundColor} from '../../Etc/ProfileImage';

const Wrapper = styled.div`
display: flex;
flex-direction: row;
align-items: flex-end;
`;

const Contents = styled.div`
display: flex;
flex-direction: column;
flex: 1;
`;

const StyledProfileImage = styled(ProfileImage)`
margin-right: 15px;
`;

export interface ChatItemProps extends HTMLAttributes<HTMLDivElement> {
    isMine: boolean;
    profileImageSrc?: string;
}

const ChatItem: React.FC<ChatItemProps> = ({isMine, profileImageSrc, children, ...args}) => {
    if (!profileImageSrc) {
        profileImageSrc = ProfileDefault;
    }

    return (
        <Wrapper {...args}>
            {!isMine && <StyledProfileImage src={profileImageSrc}
                                            backgroundColor={ProfileImageBackgroundColor.BACKGROUND}/>}
            <Contents>
                {children}
            </Contents>
        </Wrapper>
    );
};

export default ChatItem;
