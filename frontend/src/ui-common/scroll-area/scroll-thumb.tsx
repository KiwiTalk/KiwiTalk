import { assignInlineVars } from '@vanilla-extract/dynamic';
import * as styles from './scroll-thumb.css';
import { useElementScrollRect } from './utils';
import { createEffect, createSignal, on } from 'solid-js';

export type ScrollThumbProps = {
  parent?: Element | null;
  position: number;
  direction: 'vertical' | 'horizontal';
  edgeSize: number;
};
export const ScrollThumb = (props: ScrollThumbProps) => {
  const [isHide, setIsHide] = createSignal(false);
  const [expand, setExpand] = createSignal(false);

  const rect = useElementScrollRect(() => props.parent);

  const scrollWidth = () => rect().scrollWidth - rect().clientWidth;
  const scrollHeight = () => rect().scrollHeight - rect().clientHeight;
  const thumbSize = () => {
    if (props.direction === 'vertical') {
      const height = rect().clientHeight - props.edgeSize * 2;
      return height / scrollHeight() * height;
    } else {
      const width = rect().clientWidth - props.edgeSize * 2;
      return width / scrollWidth() * width;
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
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      setIsHide(true);
    }, 1000);

    setExpand(false);
  };

  return (
    <div
      classList={{
        [styles.scrollThumb.normal]: !expand(),
        [styles.scrollThumb.expand]: expand(),
        [styles.hide]: isHide(),
        [styles.scrollThumbDirectional.vertical]: props.direction === 'vertical',
        [styles.scrollThumbDirectional.horizontal]: props.direction === 'horizontal',
      }}
      style={assignInlineVars({
        [styles.thumbSize]: `${thumbSize()}px`,
        [styles.thumbPosition]: `${thumbScrollPosition()}px`,
      })}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
    />
  );
};
