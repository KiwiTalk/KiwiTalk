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
} from 'solid-js';

import { Dynamic, DynamicProps } from 'solid-js/web';

import * as styles from './scroll-area.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

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
    }, props) as ParentProps<DynamicProps<T, P>> & ScrollAreaOnlyProps,
    ['component', 'children', 'edgeSize', 'fadeValue'],
  );

  let containerRef: Element | null = null;
  const [direction, setDirection] = createSignal<'vertical' | 'horizontal'>('vertical');
  const [scrollPosition, setScrollPosition] = createSignal(0);
  const fallbackClassList = () => {
    if ('classList' in local && local.classList && typeof local.classList === 'object') {
      return local.classList as Record<string, unknown>;
    }

    return {};
  };

  const handleScroll = () => {
    if (!containerRef) return;

    let newScrollPosition = untrack(() => scrollPosition());

    if (containerRef.scrollWidth > containerRef.clientWidth) setDirection('horizontal');
    else setDirection('vertical');

    if (direction() === 'vertical') {
      newScrollPosition = containerRef.scrollTop / (
        containerRef.scrollHeight - containerRef.clientHeight
      );
    } else {
      newScrollPosition = containerRef.scrollLeft / (
        containerRef.scrollWidth - containerRef.clientWidth
      );
    }

    setScrollPosition(newScrollPosition);
  };
  onMount(() => {
    if (!containerRef) return;

    containerRef.addEventListener('scroll', handleScroll);
    if (containerRef.scrollWidth > containerRef.clientWidth) {
      setDirection('horizontal');
    }
  });

  onCleanup(() => {
    containerRef?.removeEventListener('scroll', handleScroll);
  });

  return (
    <Dynamic
      {...dynamicProps}
      ref={(element: Element) => containerRef = element}
      component={local.component}
      classList={{
        ...fallbackClassList(),
        [styles.container]: true,
        [styles.containerGap.vertical]: direction() === 'vertical',
        [styles.containerGap.horizontal]: direction() === 'horizontal',
      }}
      style={assignInlineVars({
        [styles.startEdge]: `${local.edgeSize}px`,
        [styles.endEdge]: `${local.edgeSize}px`,
        [styles.fadeValue]: `${local.fadeValue}`,
        [styles.direction]: direction() === 'vertical' ? 'to bottom' : 'to right',
      })}
    >
      {local.children}
    </Dynamic>
  );
};
