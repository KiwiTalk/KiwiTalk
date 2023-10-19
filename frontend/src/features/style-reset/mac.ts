import { macOSGlboalStyle } from './mac.css';

export const injectMacOSGlobalStyle = () => {
  if (navigator.userAgent.includes('Macintosh')) {
    document.querySelector('#root')?.classList.add(macOSGlboalStyle);
  }
};
