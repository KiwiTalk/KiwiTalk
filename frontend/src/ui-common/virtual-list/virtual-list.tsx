import {
  Accessor,
  ComponentProps,
  createEffect,
  createMemo,
  createSignal,
  For,
  mergeProps,
  on,
  onMount,
  splitProps,
  untrack,
  useTransition,
  ValidComponent,
} from 'solid-js';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { calculateVisibleRange } from './calculate-visible-range';
import * as styles from './virtual-list.css';

import type { JSX } from 'solid-js/jsx-runtime';
import { Range } from './types';

const DEFAULT_HEIGHT = 50;

type RequiredKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface VirtualListRef {
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  refresh: () => void;
  range: () => Range;
  topPadding: () => number;
  bottomPadding: () => number;

  element: HTMLElement;
  innerElement: Accessor<HTMLElement | null>;
}
export type VirtualListProps<T> = {
  ref?: (ref: VirtualListRef) => void;

  items: T[];
  children: (item: T, index: Accessor<number>) => JSX.Element;

  overscan?: number;
  itemHeight?: number | ((index: number) => number);
  estimatedItemHeight?: number;
  topMargin?: number;
  bottomMargin?: number;
  reverse?: boolean;

  innerStyle?: JSX.HTMLAttributes<HTMLDivElement>['style'];
  innerClass?: JSX.HTMLAttributes<HTMLDivElement>['class'];
}

export const VirtualList = <
  Item,
  T extends ValidComponent,
  P = ComponentProps<T>
>(props: DynamicProps<T, P> & VirtualListProps<Item>): JSX.Element => {
  const [local, classProps, componentProps, leftProps] = splitProps(
    mergeProps(
      {
        overscan: 5,
        component: 'div',
        class: '',
        classList: {},
        reverse: false,
        estimatedItemHeight: DEFAULT_HEIGHT,
      },
      props,
    ) as DynamicProps<T, P> &
      RequiredKey<VirtualListProps<Item>, 'overscan' | 'reverse' | 'estimatedItemHeight'> & {
      class: string;
      classList: Record<string, boolean>;
      onScroll?: JSX.EventHandler<T, Event>;
    },
    [
      'component',
      'items',
      'overscan',
      'itemHeight',
      'topMargin',
      'bottomMargin',
      'reverse',
      'estimatedItemHeight',
    ],
    [
      'class',
      'classList',
      'innerStyle',
      'innerClass',
    ],
    [
      'children',
      'onScroll',
    ],
  );

  const [isRangeChanged, startRangeChange] = useTransition();

  const [frameHeight, setFrameHeight] = createSignal(0);
  const [topPadding, setTopPadding] = createSignal(0);
  const [bottomPadding, setBottomPadding] = createSignal(0);
  const [range, setRange] = createSignal<[number, number]>([0, 30]);

  let frameRef: HTMLElement | undefined;
  let parentRef: HTMLDivElement | undefined;

  const defaultItemHeight: number = (
    typeof local.itemHeight === 'function' ?
      local.estimatedItemHeight :
      (local.itemHeight ?? local.estimatedItemHeight)
  );
  const itemHeights = new Map<number, number>();

  const items = createMemo(() => {
    if (local.reverse) return [...local.items].reverse();

    return local.items;
  });

  const getHeight = (index: number) => {
    const defaultValue = typeof local.itemHeight === 'function' ?
      local.itemHeight(index) :
      defaultItemHeight;

    return Number(itemHeights.get(index) ?? defaultValue);
  };

  const calculateRange = (scroll: number, height: number) => {
    const [start, end] = untrack(() => range());
    const [newStart, newEnd] = calculateVisibleRange(
      scroll,
      height,
      { getHeight, overscan: local.overscan, length: items().length },
    );

    if (start !== newStart || end !== newEnd) {
      const children = Array.from(parentRef!.children);
      for (let i = newStart; i < newEnd; i++) {
        if (!children[i - start + 1]) continue;
        if (itemHeights.has(i)) continue;

        const rect = children[i - start + 1].getBoundingClientRect();

        itemHeights.set(i, rect.height ?? defaultItemHeight);
      }

      let newTop = 0;
      let newBottom = 0;

      for (let i = 0; i < newStart; i++) {
        newTop += itemHeights.get(i) ?? defaultItemHeight;
      }
      for (let i = newEnd; i < items().length; i++) {
        newBottom += itemHeights.get(i) ?? defaultItemHeight;
      }

      startRangeChange(() => {
        setRange([newStart, newEnd]);
        setTopPadding(newTop);
        setBottomPadding(newBottom);
      });
    }
  };

  const onScroll: JSX.EventHandlerUnion<T, Event> = (event) => {
    if (!isRangeChanged()) {
      const scroll = event.target.scrollTop;
      const height = event.target.clientHeight;

      calculateRange(scroll, height);
    }

    componentProps.onScroll?.(event);
  };

  const scrollToIndex = (index: number, options: ScrollToOptions = {}) => {
    const rawIndex = local.reverse ? items().length - index - 1 : index;

    let top = 0;

    for (let i = 0; i < rawIndex; i++) {
      top += itemHeights.get(i) ?? defaultItemHeight;
    }

    frameRef?.scrollTo({
      ...options,
      top: top + (options?.top ?? 0),
    });
  };

  onMount(() => {
    const frameRect = frameRef?.getBoundingClientRect();

    if (frameRect && frameHeight() === 0) setFrameHeight(frameRect.height);
  });

  createEffect(on(() => local.reverse, () => {
    requestAnimationFrame(() => {
      frameRef?.scrollTo({ top: frameRef.scrollHeight });
    });
  }));

  createEffect(on(items, () => {
    if (!parentRef || !frameRef) return;

    const scroll = parentRef.scrollTop;
    const height = parentRef.clientHeight;

    calculateRange(scroll, height);
  }));

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const index = Number(entry.target.getAttribute('data-sorted-index'));

      if (Number.isFinite(index)) {
        const rect = entry.target.getBoundingClientRect();

        itemHeights.set(index, rect.height ?? defaultItemHeight);
      }
    }
  });
  createEffect(on(range, ([start, end]) => {
    const children = Array.from(parentRef!.children);
    resizeObserver.disconnect();

    for (let i = start; i < end; i++) {
      if (!children[i - start + 1]) continue;

      const index = local.reverse ? items().length - i - 1 : i;

      children[i - start + 1].setAttribute('data-sorted-index', i.toString());
      children[i - start + 1].setAttribute('data-index', index.toString());
      resizeObserver.observe(children[i - start + 1]);
    }
  }));

  const outerClassList = () => {
    const list: Record<string, boolean> = {
      [styles.outer]: true,
    };

    if (classProps.class) list[classProps.class] = true;
    if (classProps.classList) Object.assign(list, classProps.classList);

    return list;
  };

  const onRegisterFrame = (element: HTMLElement) => {
    frameRef = element;

    const ref: VirtualListRef = {
      scrollToIndex,
      refresh: () => {
        if (!frameRef) return;

        const scroll = frameRef.scrollTop;
        const height = frameRef.clientHeight;

        calculateRange(scroll, height);
      },
      range: () => {
        const [start, end] = range();

        if (local.reverse) return [items().length - end - 1, items().length - start - 1];
        return [start, end];
      },
      topPadding,
      bottomPadding,

      element,
      innerElement: () => parentRef ?? null,
    };
    props.ref?.(ref);
  };

  return (
    <Dynamic
      {...leftProps}
      component={local.component}
      ref={onRegisterFrame}
      classList={outerClassList()}
      onScroll={onScroll}
    >
      <div
        ref={(el) => parentRef = el}
        class={`${styles.inner} ${classProps.innerClass}`}
        style={classProps.innerStyle}
      >
        <div
          class={styles.placeholer}
          style={assignInlineVars({
            [styles.gap]: `${(local.topMargin ?? 0) + topPadding() || 0}px`,
          })}
        />
        <For each={items().slice(...range())}>
          {(item, index) => componentProps.children(
            item,
            createMemo(() => {
              const arrayIndex = index() + range()[0];

              if (local.reverse) return items().length - arrayIndex - 1;
              return arrayIndex;
            }),
          )}
        </For>
        <div
          class={styles.placeholer}
          style={assignInlineVars({
            [styles.gap]: `${(local.bottomMargin ?? 0) + bottomPadding() || 0}px`,
          })}
        />
      </div>
    </Dynamic>
  );
};
