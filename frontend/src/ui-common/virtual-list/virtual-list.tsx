import {
  Accessor,
  createEffect,
  createSignal,
  createUniqueId,
  For,
  on,
  onMount,
  splitProps,
  useTransition,
} from 'solid-js';

import { calculateVisibleRange } from './calculate-visible-range';
import * as styles from './virtual-list.css';

import type { JSX } from 'solid-js/jsx-runtime';
import { assignInlineVars } from '@vanilla-extract/dynamic';

const DEFAULT_HEIGHT = 50;

type AllowProperty = (
  'style'
  | 'class' | 'classList'
);

export interface VirtualListRef {}
export type VirtualListProps<T> = Pick<JSX.HTMLAttributes<HTMLDivElement>, AllowProperty> & {
  ref?: VirtualListRef;
  items: T[];
  children: (item: T, index: Accessor<number>) => JSX.Element;

  overscan?: number;
  itemHeight?: number | ((index: number) => number);
  topMargin?: number;
  bottomMargin?: number;

  innerStyle?: JSX.HTMLAttributes<HTMLDivElement>['style'];
  innerClass?: JSX.HTMLAttributes<HTMLDivElement>['class'];
}

export const VirtualList = <T, >(props: VirtualListProps<T>): JSX.Element => {
  const [local, children, leftProps] = splitProps(props, [
    'items',
    'overscan',
    'itemHeight',
    'topMargin',
    'bottomMargin',
    'class',
    'innerStyle',
    'innerClass',
  ], ['children']);

  const ignoreClass = createUniqueId();

  const [frameHeight, setFrameHeight] = createSignal(0);
  const [topPadding, setTopPadding] = createSignal(0);
  const [bottomPadding, setBottomPadding] = createSignal(0);

  const [isRangeChanged, startRangeChange] = useTransition();

  const defaultItemHeight = (
    typeof local.itemHeight === 'function' ?
      DEFAULT_HEIGHT :
      (local.itemHeight ?? DEFAULT_HEIGHT)
  );
  const itemHeights = new Map<number, number>();
  const [range, setRange] = createSignal<[number, number]>([0, 30]);

  const getHeight = (index: number) => {
    const defaultValue = typeof local.itemHeight === 'function' ?
      local.itemHeight(index) :
      defaultItemHeight;

    return Number(itemHeights.get(index) ?? defaultValue);
  };

  let frameRef: HTMLDivElement | undefined;
  let parentRef: HTMLDivElement | undefined;

  const calculateRange = (scroll: number, height: number) => {
    const top = topPadding();
    const [start, end] = range();
    const [newStart, newEnd] = calculateVisibleRange(
      [start, end],
      { top, scroll, height },
      { getHeight, overscan: local.overscan ?? 5, length: local.items.length },
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
      for (let i = newEnd; i < local.items.length; i++) {
        newBottom += itemHeights.get(i) ?? defaultItemHeight;
      }

      startRangeChange(() => {
        setRange([newStart, newEnd]);
        setTopPadding(newTop);
        setBottomPadding(newBottom);
      });
    }
  };

  const onScroll: JSX.EventHandlerUnion<HTMLDivElement, Event> = (event) => {
    if (isRangeChanged()) return;

    const scroll = event.target.scrollTop;
    const height = event.target.clientHeight;

    calculateRange(scroll, height);
  };

  onMount(() => {
    const frameRect = frameRef?.getBoundingClientRect();

    if (frameRect && frameHeight() === 0) setFrameHeight(frameRect.height);
  });

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const index = Number(entry.target.getAttribute('data-index'));

      if (Number.isFinite(index)) {
        const rect = entry.target.getBoundingClientRect();

        itemHeights.set(index, rect.height ?? defaultItemHeight);
      }
    }
  });

  createEffect(on(() => local.items, () => {
    if (!parentRef || !frameRef) return;

    const scroll = parentRef.scrollTop;
    const height = parentRef.clientHeight;

    calculateRange(scroll, height);
  }));

  createEffect(() => {
    const [start, end] = range();

    const children = Array.from(parentRef!.children);
    resizeObserver.disconnect();
    for (let i = start; i < end; i++) {
      if (!children[i - start + 1]) continue;

      children[i - start + 1].setAttribute('data-index', i.toString());
      resizeObserver.observe(children[i - start + 1]);
    }
  });

  const outerClassList = () => {
    const list: Record<string, boolean> = {
      [styles.outer]: true,
    };

    if (local.class) list[local.class] = true;
    if (leftProps.classList) Object.assign(list, leftProps.classList);

    return list;
  };

  return (
    <div
      {...leftProps}
      ref={frameRef}
      classList={outerClassList()}
      onScroll={onScroll}
    >
      <div
        ref={parentRef}
        class={`${styles.inner} ${local.innerClass}`}
        style={local.innerStyle}
      >
        <div
          class={`${styles.placeholer} ${ignoreClass}`}
          style={assignInlineVars({
            [styles.gap]: `${(local.topMargin ?? 0) + topPadding() || 0}px`,
          })}
        />
        <For each={local.items.slice(...range())}>
          {(item, index) => children.children(item, () => index() + range()[0])}
        </For>
        <div
          class={`${styles.placeholer} ${ignoreClass}`}
          style={assignInlineVars({
            [styles.gap]: `${(local.bottomMargin ?? 0) + bottomPadding() || 0}px`,
          })}
        />
      </div>
    </div>
  );
};
