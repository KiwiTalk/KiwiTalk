import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';

import {
  AttachmentTemplate,
  ChatType,
  FileAttachment,
  PhotoAttachment,
  VideoAttachment,
} from 'node-kakao';

export async function makeTemplate(
    type: ChatType,
    _path: string,
): Promise<AttachmentTemplate | undefined> {
  const file = fs.readFileSync(_path);
  const name = path.basename(_path);

  switch (type) {
    case ChatType.Photo: {
      const {
        width,
        height,
      } = sizeOf(_path);
      const photo = await PhotoAttachment.fromBuffer(
          file,
          name,
          width ?? 0,
          height ?? 0,
      );

      return new AttachmentTemplate(photo, 'KiwiTalk 사진');
    }
    case ChatType.Video: {
      const video = await VideoAttachment.fromBuffer(
          file,
          name,
          1280,
          720,
          30,
      ); // width height duration

      return new AttachmentTemplate(video, 'KiwiTalk 동영상');
    }
    case ChatType.File: {
      const fileAttachment = await FileAttachment.fromBuffer(file, name);

      return new AttachmentTemplate(fileAttachment, 'KiwiTalk 파일');
    }
  }
}

export default {
  makeTemplate,
};
