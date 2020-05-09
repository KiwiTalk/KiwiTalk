let remote: any;

if (window.require) {
  remote = window.require('electron').remote;
}

export const getCurrentWindow = () => {
  if (remote) return remote.getCurrentWindow();
};

export const minimizeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow.minimizable) {
    browserWindow.minimize();
  }
};

export const maximizeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow.maximizable) {
    browserWindow.maximize();
  }
};

export const unMaximizeWindow = (browserWindow = getCurrentWindow()) => {
  browserWindow.unmaximize();
};

export const maxUnMaxWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow.isMaximized()) {
    browserWindow.unmaximize();
  } else {
    browserWindow.maximize();
  }
};

export const closeWindow = (browserWindow = getCurrentWindow()) => {
  browserWindow.close();
};

export const isWindowMaximized = (browserWindow = getCurrentWindow()) => {
  return browserWindow.isMaximized();
};

export const registerMaxUnMaximizeEventListener = (listener: () => void, browserWindow = getCurrentWindow()) => {
  browserWindow.once('maximize', listener);
  browserWindow.once('unmaximize', listener);
}
