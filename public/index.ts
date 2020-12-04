import * as os from 'os';

import {TalkClient} from 'node-kakao';

import loginModules from './login';
import utilModules from './utils';
import chatModules from './chat';

const globalAny = global as any;

(async () => {
    const uuid = await utilModules.getUUID();

    globalAny.talkClient = new TalkClient(os.hostname(), uuid);

    console.log('load uuid', uuid)
})();

globalAny.login = loginModules;
globalAny.util = utilModules;
globalAny.chat = chatModules;

let setting: NWJS_Helpers.WindowOpenOption = {
    frame: true,
    width: 800,
    height: 600,
    show_in_taskbar: true,
    title: 'KiwiTalk'
};

switch (os.platform()) {
    case 'win32': case 'darwin': case 'cygwin':
        setting.frame = false;
        break;
}

nw.Window.open('localhost:3000', setting, (win) => {
    win?.showDevTools()
});

