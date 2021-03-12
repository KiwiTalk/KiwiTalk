// eslint-disable-next-line @typescript-eslint/no-var-requires
const os = require('os');

const setting = {
  frame: true,
  width: 800,
  height: 600,
  show_in_taskbar: true,
  new_instance: false,
  title: 'KiwiTalk',
  min_width: 360,
  min_height: 460,
};

switch (os.platform()) {
  case 'win32':
  case 'darwin':
  case 'cygwin':
    setting.frame = false;
    break;
}

if (nw.App.argv.includes('--dev')) {
  nw.Window.open(
      'localhost:3000',
      setting,
      (win) => win?.showDevTools(),
  );
} else {
  nw.Window.open(
      'index.html',
      setting,
  );
}
