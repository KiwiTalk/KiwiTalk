import fs from "fs";
import path from "path";

import {AttachmentTemplate, ChatType, FileAttachment, PhotoAttachment, VideoAttachment} from 'node-kakao';

const sizeOf = require('image-size');

export async function makeTemplate (type, _path) {
    const file = fs.readFileSync(_path);
    const name = path.basename(_path);

    switch (type) {
        case ChatType.Photo:
            const { width, height } = sizeOf(_path);
            // @ts-ignore
            const photo = await PhotoAttachment.fromBuffer(file, name, width, height);

            return new AttachmentTemplate(photo, 'KiwiTalk 사진');
        case ChatType.Video:
            // @ts-ignore
            const video = await VideoAttachment.fromBuffer(file, name, 1280, 720, 30); // width height duration

            return new AttachmentTemplate(video, 'KiwiTalk 동영상');
        case ChatType.File:
            // @ts-ignore
            const fileAttachment = await FileAttachment.fromBuffer(file, name, 1280, 720);

            return new AttachmentTemplate(fileAttachment, 'KiwiTalk 파일');
    }
}

export default {
    makeTemplate
}
