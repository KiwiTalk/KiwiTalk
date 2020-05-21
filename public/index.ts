import localforage from 'localforage';
import {v4} from 'uuid';
import {TalkClient} from 'node-kakao/dist';
import * as os from 'os';

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

