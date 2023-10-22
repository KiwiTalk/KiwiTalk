import {
  ValidComponent,
  ComponentProps,
  ParentProps,
  splitProps,
  mergeProps,
  onMount,
  onCleanup,
  createSignal,
  untrack,
  Accessor,
  createEffect,
  on,
} from 'solid-js';

import { Dynamic, DynamicProps } from 'solid-js/web';

import * as styles from './scroll-area.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

type ScrollRect = {
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}
const useElementScrollRect = (maybeElement: Accessor<Element | null>) => {
  const [rect, setRect] = createSignal<ScrollRect>({
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
  });

  const resizeObserver = new ResizeObserver((entries) => {
    const target = entries[0].target;

    setRect({
      scrollWidth: target.scrollWidth,
      scrollHeight: target.scrollHeight,
      clientWidth: target.clientWidth,
      clientHeight: target.clientHeight,
    });
  });

  createEffect(on(maybeElement, (target) => {
    if (!target) {
      resizeObserver.disconnect();
      return;
    }

    resizeObserver.observe(target);
  }));

  onCleanup(() => {
    resizeObserver.disconnect();
  });

  return rect;
};

const recordStyleToString = (...styles: (Record<string, unknown> | string)[]) => {
  return styles.reduce((acc, style) => {
    if (typeof style === 'string') return `${acc} ${style}`;

    return Object.entries(style).reduce((acc, [key, value]) => {
      return `${acc}${key}: ${value};`;
    }, acc);
  }, '');
};

type ScrollAreaOnlyProps = {
  edgeSize?: number;
  fadeValue?: number;
};
export const ScrollArea = <
  T extends ValidComponent,
  P = ComponentProps<T>
>(props: Partial<ParentProps<DynamicProps<T, P>> & ScrollAreaOnlyProps>) => {
  const [local, dynamicProps] = splitProps(
    mergeProps({
      component: 'div',
      edgeSize: 16,
      fadeValue: 0,
    }, props) as ParentProps<DynamicProps<T, P>> & Required<ScrollAreaOnlyProps>,
    ['component', 'children', 'edgeSize', 'fadeValue'],
  );

  /* signals */
  const [container, setContainer] = createSignal<Element | null>(null);
  const [direction, setDirection] = createSignal<'vertical' | 'horizontal'>('vertical');
  const [scrollPosition, setScrollPosition] = createSignal(0);

  const rect = useElementScrollRect(container);

  /* computed */
  const fallbackClassList = () => {
    if (
      'classList' in dynamicProps &&
      dynamicProps.classList &&
      typeof dynamicProps.classList === 'object'
    ) {
      return dynamicProps.classList as Record<string, unknown>;
    }

    return {};
  };
  const fallbackStyle = () => {
    if ('style' in dynamicProps) return dynamicProps.style as Record<string, unknown> | string;

    return '';
  };

  const scrollWidth = () => rect().scrollWidth - rect().clientWidth;
  const scrollHeight = () => rect().scrollHeight - rect().clientHeight;

  const thumbSize = () => {
    if (direction() === 'vertical') {
      const height = rect().clientHeight - local.edgeSize * 2;
      return height / scrollHeight() * height;
    } else {
      const width = rect().clientWidth - local.edgeSize * 2;
      return width / scrollWidth() * width;
    }
  };
  const thumbScrollPosition = () => {
    const offset = local.edgeSize * 2 + thumbSize();

    if (direction() === 'vertical') {
      const defaultTop = scrollPosition() * scrollHeight();
      const offsetTop = scrollPosition() * (rect().clientHeight - offset);

      return local.edgeSize + defaultTop + offsetTop;
    }

    const defaultLeft = scrollPosition() * scrollWidth();
    const offsetLeft = scrollPosition() * (rect().clientWidth - offset);

    return local.edgeSize + defaultLeft + offsetLeft;
  };

  /* lifecycle */
  const handleScroll = () => {
    let newPosition = untrack(() => scrollPosition());

    if (direction() === 'vertical') newPosition = (container()?.scrollTop ?? 0) / scrollHeight();
    else newPosition = (container()?.scrollLeft ?? 0) / scrollWidth();

    setScrollPosition(newPosition);
  };
  onMount(() => {
    const target = container();
    if (!target) return;

    target.addEventListener('scroll', handleScroll);
  });

  createEffect(on(rect, (rect) => {
    if (rect.scrollWidth > rect.clientWidth) setDirection('horizontal');
    else setDirection('vertical');
  }));

  onCleanup(() => {
    container()?.removeEventListener('scroll', handleScroll);
  });

  return (
    <Dynamic
      {...dynamicProps}
      ref={setContainer}
      component={local.component}
      classList={{
        ...fallbackClassList(),
        [styles.container]: true,
        [styles.containerDirectional.vertical]: direction() === 'vertical',
        [styles.containerDirectional.horizontal]: direction() === 'horizontal',
      }}
      style={recordStyleToString(assignInlineVars({
        [styles.startEdge]: `${local.edgeSize}px`,
        [styles.endEdge]: `${local.edgeSize}px`,
        [styles.fadeValue]: `${local.fadeValue}`,
        [styles.direction]: direction() === 'vertical' ? 'to bottom' : 'to right',
      }), fallbackStyle())}
    >
      {local.children}
      <div
        classList={{
          [styles.scrollThumb]: true,
          [styles.scrollThumbDirectional.vertical]: direction() === 'vertical',
          [styles.scrollThumbDirectional.horizontal]: direction() === 'horizontal',
        }}
        style={assignInlineVars({
          [styles.thumbSize]: `${thumbSize()}px`,
          [styles.thumbPosition]: `${thumbScrollPosition()}px`,
        })}
      />
    </Dynamic>
  );
};
