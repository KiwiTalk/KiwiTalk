/* eslint-disable @typescript-eslint/ban-types */

import '@vanilla-extract/css';
import type { PropertiesFallback } from 'csstype';

declare module '@vanilla-extract/css' {
  interface CSSProperties extends PropertiesFallback<number | (string & {})> {
    WebkitAppRegion?: 'drag' | 'no-drag';
    WebkitUserDrag?: 'none' | 'element' | 'auto';
  }
}
