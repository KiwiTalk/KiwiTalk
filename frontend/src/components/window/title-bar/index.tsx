import { useEffect } from 'react';
import { useRef } from 'react';

export type WindowTitleBarProp = React.PropsWithChildren<{
  onDragStart?: () => void,
  onDrag?: (deltaX: number, deltaY: number) => void,
  onDragEnd?: (deltaX: number, deltaY: number) => void,
  onDoubleClick?: () => void,

  className?: string
}>;

export const WindowTitleBar = (prop: WindowTitleBarProp) => {
  const titleBarRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ startX: number, startY: number } | null>(null);

  useEffect(() => {
    function pointerMoveHandler(e: PointerEvent) {
      if (!draggingRef.current) return;
      const { startX, startY } = draggingRef.current;

      prop.onDrag?.(e.screenX - startX, e.screenY - startY);
    }

    function pointerUpHandler(e: PointerEvent) {
      if (!draggingRef.current) return;
      const { startX, startY } = draggingRef.current;

      prop.onDragEnd?.(e.screenX - startX, e.screenY - startY);
      draggingRef.current = null;
    }

    window.addEventListener('pointermove', pointerMoveHandler);
    window.addEventListener('pointerup', pointerUpHandler);
    return () => {
      window.removeEventListener('pointermove', pointerMoveHandler);
      window.removeEventListener('pointerup', pointerUpHandler);
    };
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== titleBarRef.current) return;
    const startX = event.screenX;
    const startY = event.screenY;
    draggingRef.current = { startX, startY };

    prop.onDragStart?.();
  }

  function onDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== titleBarRef.current) return;

    prop.onDoubleClick?.();
  }

  return <div
    className={prop.className}
    onPointerDown={onPointerDown}
    onDoubleClick={onDoubleClick}
    ref={titleBarRef}
  >
    {prop.children}
  </div>;
};
