import { Range } from './types';

type RangeUtilOptions = {
  getHeight: (index: number) => number;
  overscan: number;
  length: number;
}
export const calculateVisibleRange = (
  scrollTop: number,
  clientHeight: number,
  { getHeight, overscan, length }: RangeUtilOptions,
): Range => {
  let newStartIndex = 0;
  let newEndIndex = 0;

  let index = 0;
  let topOffset = 0;
  for (; topOffset < scrollTop; index += 1) {
    topOffset += getHeight(index);
  }
  newStartIndex = Math.max(index - overscan, 0);

  for (; topOffset < scrollTop + clientHeight; index += 1) {
    topOffset += getHeight(index);
  }
  newEndIndex = Math.min(index + overscan, length);

  return [newStartIndex, newEndIndex];
};
