import isElectron from 'is-electron';

let electron;
let ipcRenderer: any;
let remote: any;

if (isElectron()) {
  electron = window.require('electron');
  remote = electron.remote;
  ipcRenderer = electron.ipcRenderer;
}

export const getIpcRenderer = () => {
  return ipcRenderer;
};

export const getCurrentWindow = () => {
  if (isElectron()) return remote.getCurrentWindow();
  else return undefined;
};

export const minimizeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow && browserWindow.minimizable) {
    browserWindow.minimize();
  }
};

export const maximizeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow && browserWindow.maximizable) {
    browserWindow.maximize();
  }
};

export const unMaximizeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow) {
    browserWindow.unmaximize();
  }
};

export const maxUnMaxWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow && browserWindow.isMaximized()) {
    browserWindow.unmaximize();
  } else if (browserWindow) {
    browserWindow.maximize();
  }
};

export const closeWindow = (browserWindow = getCurrentWindow()) => {
  if (browserWindow) {
    browserWindow.close();
  }
};

export const isWindowMaximized = (browserWindow = getCurrentWindow()) => {
  if (browserWindow) {
    return browserWindow.isMaximized();
  } else {
    return undefined;
  }
};
