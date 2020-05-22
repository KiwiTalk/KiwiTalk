import localforage from 'localforage';
import { v4 } from 'uuid';
import { TalkClient, PhotoAttachment, AttachmentTemplate, ChatType, VideoAttachment, FileAttachment } from 'node-kakao/dist';
import * as os from 'os';
import fs from 'fs';
import path from 'path';

// @ts-ignore
global.createNewUUID = (): string => {
    return Buffer.from(v4()).toString('base64');
}
// @ts-ignore
global.getUUID = async (): Promise<string> => {
    try {
        const uuid = await localforage.getItem('uuid') as string | null;
        if (uuid)
            return uuid;
        else
            throw new Error();
    } catch (e) {
        // @ts-ignore
        let uuid = global.createNewUUID();
        localforage.setItem('uuid', uuid)
            .catch((error) => {
                console.log(error);
            });
        return uuid;
    }
}

// @ts-ignore
global.talkClient = new TalkClient(os.hostname());

// @ts-ignore
global.makeTemplate = async (type, _path) => {
    const file = fs.readFileSync(_path);
    const name = path.basename(_path);

    switch (type) {
        case ChatType.Photo:
            const photo = await PhotoAttachment.fromBuffer(file, name, 1280, 720);

            return new AttachmentTemplate(photo, 'KiwiTalk 사진');
        case ChatType.Video:
            const video = await VideoAttachment.fromBuffer(file, name, 1280, 720, 30); // width height duration

            return new AttachmentTemplate(video, 'KiwiTalk 동영상');
        case ChatType.File:
            const fileAttachment = await FileAttachment.fromBuffer(file, name, 1280, 720);

            return new AttachmentTemplate(fileAttachment, 'KiwiTalk 파일');
    }
}

let setting: NWJS_Helpers.WindowOpenOption = {
    frame: true,
    width: 800,
    height: 600,
    show_in_taskbar: true,
    title: 'KiwiTalk'
};

switch (os.platform()) {
    case 'win32':
    case 'darwin':
    case 'cygwin':
        setting.frame = false;
        break;
}

nw.Window.open('localhost:3000', setting, (win) => {
    win?.showDevTools()
});

