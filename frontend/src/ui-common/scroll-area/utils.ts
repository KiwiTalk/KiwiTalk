import { Accessor, createSignal, createEffect, on, onCleanup } from 'solid-js';

type ScrollRect = {
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}
export const useElementScrollRect = (maybeElement: Accessor<Element | undefined | null>) => {
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

export const recordStyleToString = (...styles: (Record<string, unknown> | string)[]) => {
  return styles.reduce((acc, style) => {
    if (typeof style === 'string') return `${acc} ${style}`;

    return Object.entries(style).reduce((acc, [key, value]) => {
      return `${acc}${key}: ${value};`;
    }, acc);
  }, '');
};
