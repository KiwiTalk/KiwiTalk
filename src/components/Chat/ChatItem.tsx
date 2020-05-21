import React, {HTMLAttributes} from 'react';
import styled from 'styled-components';
import ProfileImage, {ProfileImageBackgroundColor} from '../UiComponent/ProfileImage';

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
    profileImageSrc?: string
}

const ChatItem: React.FC<ChatItemProps> = ({profileImageSrc, children, ...args}) => {
    return (
        <Wrapper {...args}>
            {profileImageSrc && <StyledProfileImage src={profileImageSrc}
                                                    backgroundColor={ProfileImageBackgroundColor.BACKGROUND}/>}
            <Contents>
                {children}
            </Contents>
        </Wrapper>
    );
};

export default ChatItem;
