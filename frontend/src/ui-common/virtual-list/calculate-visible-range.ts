import { HeightGetter, Range } from './types';

const getDifference = (
  index: number,
  [origin, destination]: [number, number],
  getHeight: HeightGetter,
  direction: -1 | 1,
): number => {
  let value = 1;

  let offsetStack = getHeight(index - value);
  while (direction * (origin + (offsetStack * direction) - destination) < 0) {
    offsetStack += getHeight(index + value * direction);
    value += 1;
  }

  return index + (value - 1) * direction;
};

type RequiredValue = {
  top: number;
  scroll: number;
  height: number;
};
type Option = {
  getHeight: HeightGetter;
  overscan: number;
  length: number;
};

export const calculateVisibleRange = (
  [start, end]: Range,
  { top, scroll, height }: RequiredValue,
  { getHeight, overscan, length }: Option,
): Range => {
  let startMaxOffset = 0;
  let startMinOffset = 0;

  for (let i = 0; i < overscan; i++) {
    const startValue = getHeight(start + i);

    startMaxOffset += startValue;
    if (i < overscan - 1) startMinOffset += startValue;
  }

  let newStart = start;
  let newEnd = end;

  if (top + startMaxOffset < scroll) {
    newStart = Math.min(
      getDifference(newStart, [top + startMaxOffset, scroll], getHeight, 1),
      length,
    );
  }

  if (top + startMinOffset > scroll) {
    newStart = Math.max(
      getDifference(newStart, [top + startMinOffset, scroll], getHeight, -1),
      0,
    );
  }

  let newHeight = 0;
  let index = newStart;
  while (newHeight - startMaxOffset < height) {
    const value = getHeight(index);
    newHeight += value;
    index += 1;
  }

  newEnd = Math.min(newStart + index - newStart + overscan + 1, length);

  return [newStart, newEnd];
};
