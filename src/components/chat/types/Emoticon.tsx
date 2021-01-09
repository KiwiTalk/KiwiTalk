import React from 'react';
import { Chat, EmoticonAttachment } from 'node-kakao';

interface EmoticonProps {
  chat: Chat;
}

const Emoticon: React.FC<EmoticonProps> = ({ chat }) => {
  return <>
    {
      chat.AttachmentList.map((attachment) => {
        if (attachment instanceof EmoticonAttachment) {
          const playSound = async () => {
            if (attachment.Sound) {
              const url = `http://item-kr.talk.kakao.co.kr/dw/${attachment.Sound}`;
              const sound = new Audio(url);

              await sound.play();
            }
          };

          return <img
            src={attachment.getEmoticonURL()}
            width={attachment.Width > 0 ? attachment.Width : '150px'}
            height={attachment.Height > 0 ? attachment.Height : '150px'}
            onClick={playSound}
            onLoad={playSound}/>;
        }

        return <div/>;
      })
    }
  </>;
};

export default Emoticon;
