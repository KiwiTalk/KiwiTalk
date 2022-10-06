export type WindowTitleBarProp = React.PropsWithChildren<{
  className?: string
}>;

export const WindowTitleBar = (prop: WindowTitleBarProp) => {
  return <div
    className={prop.className}
    data-tauri-drag-region
  >
    {prop.children}
  </div>;
};
