import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Header = styled.div`
  font-size: 24px;
  color: #00A4FF;
  font-weight: bold;
  margin: 8px;
`

const SearchItemContainer = styled.div`
  background-color: #F6F6F6;
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  width: 280px;

  display: flex;
`

const SearchItemTextContainer = styled.div`
  width: auto;
  display: flex;
  flex-direction: column;
  flex-basis: 0;
  flex-grow: 1;

  min-width: 0;
`

const SearchItemHead = styled.div`
`

const SearchItemInfo = styled.div`
  color: #808080;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`
const SearchItemImage = styled.img`
  float: right;
  margin: 8px;
`

interface SearchChatProps {
    question: string,
    type: string,
    list: any[],
}

const resize = (width: number, height: number) => {
    const ratio = width / height

    height = Math.min(74, height);
    width = ratio * height;

    return [width, height]
}

export const SearchChat: React.FC<SearchChatProps> = (chat: SearchChatProps) => {
    return (
        <Wrapper>
            <Header>#{chat.question}</Header>
            {
                chat.list.map((data) => <SearchItemContainer>
                    {
                        (() => {
                            if (data.Text === undefined) {
                                return null
                            } else {
                                return <SearchItemTextContainer>
                                    <SearchItemHead>{data.Text.Text}</SearchItemHead>
                                    <SearchItemInfo>{data.InfoText}</SearchItemInfo>
                                </SearchItemTextContainer>
                            }
                        })()
                    }

                    {
                        (() => {
                            if (data.Image === undefined) {
                                return null
                            } else {
                                const [w, h] = resize(data.Image.ImageWidth, data.Image.ImageHeight);
                                console.log(w, h)
                                return <SearchItemImage src={data.Image.ImageURL}
                                                        style={{width: w, height: h}}></SearchItemImage>
                            }
                        })()
                    }
                </SearchItemContainer>)
            }
        </Wrapper>
    );
};

export default SearchChat;

/*

attachmentList
  ContentType: list
    ContentList
      RedirectURL
      Text
        Text
        Description
      InfoText
      Image
        ImageURL
        ImageWidth
        ImageHeight
  ContentType: image
    ContentList
      RedirectURL
      Text
        Text
        Description
      InfoText
      Image
        ImageURL
        ImageWidth
        ImageHeight
*/