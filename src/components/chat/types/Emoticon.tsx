import React from 'react';
import { Chat, EmoticonAttachment, KnownChatType, KnownPostItemType } from 'node-kakao';

interface EmoticonProps {
  chat: Chat;
}

const Emoticon: React.FC<EmoticonProps> = ({ chat }) => {
  return <>
    {
      ((attachment) => {
        if (attachment) {
          if (chat.type === KnownPostItemType.EMOTICON) {
            const emoticonAttachment = attachment as EmoticonAttachment;

            if (emoticonAttachment.width && emoticonAttachment.height) {
              const playSound = async () => {
                if (emoticonAttachment.sound) {
                  const url = `http://item-kr.talk.kakao.co.kr/dw/${emoticonAttachment.sound}`;
                  const sound = new Audio(url);

                  await sound.play();
                }
              };

              return <img
                key={`emoticon-${emoticonAttachment.path}`}
                src={emoticonAttachment.path}
                width={emoticonAttachment.width > 0 ? emoticonAttachment.width : '150px'}
                height={emoticonAttachment.height > 0 ? emoticonAttachment.height : '150px'}
                onClick={playSound}
                onLoad={playSound}/>;
            }
          }
        }

        return <div key={`emoticon-$i`}/>;
      })(chat.attachment)
    }
  </>;
};

export default Emoticon;
