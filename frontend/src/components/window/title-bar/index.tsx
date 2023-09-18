import { ParentProps } from 'solid-js';

export type WindowTitleBarProp = ParentProps<{
  class?: string;
}>;

export const WindowTitleBar = (prop: WindowTitleBarProp) => {
  return <div
    class={prop.class}
    data-tauri-drag-region
  >
    {prop.children}
  </div>;
};
