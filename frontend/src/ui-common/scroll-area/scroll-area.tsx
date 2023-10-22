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
  createEffect,
  on,
} from 'solid-js';

import { Dynamic, DynamicProps } from 'solid-js/web';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import { recordStyleToString, useElementScrollRect } from './utils';

import * as styles from './scroll-area.css';
import { ScrollThumb } from './scroll-thumb';

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
      <ScrollThumb
        parent={container()}
        position={scrollPosition()}
        direction={direction()}
        edgeSize={local.edgeSize}
      />
    </Dynamic>
  );
};
