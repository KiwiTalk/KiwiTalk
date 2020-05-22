import localforage from 'localforage';
import { v4 } from 'uuid';
import { TalkClient, PhotoAttachment, AttachmentTemplate } from 'node-kakao/dist';
import * as os from 'os';
import fs from 'fs';

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
global.send = (path, channel) => {
    const file = fs.readFileSync(path)

    PhotoAttachment.fromBuffer(file, 'testname', 1280, 720)
        .then((result: PhotoAttachment) => {
            console.log('photo 2')
            const template = new AttachmentTemplate(result, 'KiwiTalk 사진');
            channel.sendTemplate(template)
                .then(result => {
                    console.log('photo 3')
                })
                .catch((error: any) => {
                    alert(`메시지 발송 중 오류 발생 ${error}`);
                });
        })
        .catch((error: any) => {
            console.log(error)
            alert(`메시지 발송 중 오류 발생 ${error}`);
        });
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

