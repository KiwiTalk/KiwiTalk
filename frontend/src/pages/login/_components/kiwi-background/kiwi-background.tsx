import { Accessor, createSignal, onCleanup, onMount } from 'solid-js';
import * as styles from './kiwi-background.css';

const useMousePosition = (): [x: Accessor<number>, y: Accessor<number>] => {
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);

  const handleMouseMove = (event: PointerEvent) => {
    setX(event.x);
    setY(event.y);
  };
  onMount(() => {
    window.addEventListener('pointermove', handleMouseMove);
  });

  onCleanup(() => {
    window.removeEventListener('pointermove', handleMouseMove);
  });

  return [x, y];
};

export const KiwiBackground = () => {
  const circleOffset = 25;
  const kiwiOffset = 50;

  const [x, y] = useMousePosition();

  let containerRef: HTMLDivElement | null = null;
  let circleRef: HTMLDivElement | null = null;
  let kiwiRef: HTMLDivElement | null = null;
  const getStyle = (
    element: HTMLDivElement | null,
    offset = 25,
  ): string => {
    if (!element) return '';
    if (!containerRef) return '';

    const centerX = element.clientWidth / 2 + element.offsetLeft;
    const centerY = element.clientHeight / 2 + element.offsetTop;
    const offsetX = (x() - centerX) / containerRef.clientWidth * offset;
    const offsetY = (y() - centerY) / containerRef.clientHeight * offset;

    return `
      --offset-x: ${offsetX}px;
      --offset-y: ${offsetY}px;
    `;
  };

  return (
    <div ref={(el) => containerRef = el} class={styles.container}>
      <div
        ref={(el) => circleRef = el}
        class={styles.circle}
        style={getStyle(circleRef, circleOffset)} />
      <div
        ref={(el) => kiwiRef = el}
        class={styles.kiwi}
        style={getStyle(kiwiRef, kiwiOffset)}
      />
    </div>
  );
};
