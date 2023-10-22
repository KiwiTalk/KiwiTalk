import { assignInlineVars } from '@vanilla-extract/dynamic';
import * as styles from './scroll-thumb.css';
import { useElementScrollRect } from './utils';
import { createEffect, createSignal, on } from 'solid-js';

export type ScrollThumbProps = {
  parent?: Element | null;
  position: number;
  direction: 'vertical' | 'horizontal';
  edgeSize: number;

  onScroll?: (position: number) => void;
};
export const ScrollThumb = (props: ScrollThumbProps) => {
  const [thumbRef, setThumbRef] = createSignal<HTMLDivElement | null>(null);
  const [isScroll, setIsScroll] = createSignal(false);
  const [isHide, setIsHide] = createSignal(false);
  const [expand, setExpand] = createSignal(false);

  const rect = useElementScrollRect(() => props.parent);

  const scrollWidth = () => rect().scrollWidth - rect().clientWidth;
  const scrollHeight = () => rect().scrollHeight - rect().clientHeight;
  const thumbSize = () => {
    if (props.direction === 'vertical') {
      const height = rect().clientHeight - props.edgeSize * 2;
      return height / rect().scrollHeight * height;
    } else {
      const width = rect().clientWidth - props.edgeSize * 2;
      return width / rect().scrollWidth * width;
    }
  };
  const thumbScrollPosition = () => {
    const offset = props.edgeSize * 2 + thumbSize();

    if (props.direction === 'vertical') {
      const defaultTop = props.position * scrollHeight();
      const offsetTop = props.position * (rect().clientHeight - offset);

      return props.edgeSize + defaultTop + offsetTop;
    }

    const defaultLeft = props.position * scrollWidth();
    const offsetLeft = props.position * (rect().clientWidth - offset);

    return props.edgeSize + defaultLeft + offsetLeft;
  };

  let timeout: NodeJS.Timeout | null = null;
  createEffect(on(() => props.position, () => {
    setIsHide(false);
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      setIsHide(true);
    }, 1000);
  }));

  const onHover = () => {
    setIsHide(false);
    if (timeout) clearTimeout(timeout);

    setExpand(true);
  };
  const onLeave = () => {
    if (typeof timeout === 'number') clearTimeout(timeout);
    if (isScroll()) return;

    timeout = setTimeout(() => {
      setIsHide(true);
    }, 1000);

    setExpand(false);
  };

  const onScrollStart = (event: PointerEvent) => {
    setIsScroll(true);

    const parentRect = props.parent?.getBoundingClientRect();
    const thumbRect = thumbRef()?.getBoundingClientRect();
    const startPosition = props.direction === 'vertical' ?
      (parentRect?.y ?? 0) :
      (parentRect?.x ?? 0);
    const thumbOffset = props.direction === 'vertical' ?
      (event.y ?? 0) - (thumbRect?.top ?? 0) :
      (event.x ?? 0) - (thumbRect?.left ?? 0);

    const onScrollMove = (event: PointerEvent) => {
      const currentPosition = props.direction === 'vertical' ? event.y : event.x;
      const offset = currentPosition - startPosition - thumbOffset;
      const scrollOffset = offset / (
        (props.direction === 'vertical' ?
          rect().clientHeight :
          rect().clientWidth
        ) - thumbSize()
      );

      props.onScroll?.(scrollOffset);
    };

    const onScrollEnd = () => {
      window.removeEventListener('pointermove', onScrollMove);
      window.removeEventListener('pointerup', onScrollEnd);

      requestAnimationFrame(() => {
        setExpand(true);
        setIsHide(false);
        setIsScroll(false);
      });
    };

    window.addEventListener('pointermove', onScrollMove);
    window.addEventListener('pointerup', onScrollEnd);
  };

  return (
    <div
      ref={setThumbRef}
      classList={{
        [styles.scrollThumb.normal]: !expand(),
        [styles.scrollThumb.expand]: isScroll() || expand(),
        [styles.hide]: !isScroll() && isHide(),
        [styles.scrollThumbDirectional.vertical]: props.direction === 'vertical',
        [styles.scrollThumbDirectional.horizontal]: props.direction === 'horizontal',
      }}
      style={assignInlineVars({
        [styles.thumbSize]: `${thumbSize()}px`,
        [styles.thumbPosition]: `${thumbScrollPosition()}px`,
      })}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      onPointerDown={onScrollStart}
    />
  );
};
