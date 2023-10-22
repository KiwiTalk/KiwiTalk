import { StoryFn } from 'storybook-solidjs';

import { ScrollArea } from './scroll-area';
import * as styles from './scroll-area.stories.css';

export default {
  title: 'KiwiTalk v2/ui/Scroll Area',
  component: ScrollArea,
};

type ScrollAreaProps = {
  edgeSize?: number;
  fadeValue?: number;
}
const VerticalTemplate: StoryFn = (props: ScrollAreaProps) => {
  return (
    <div class={styles.background.vertical}>
      <ScrollArea {...props} class={styles.container.vertical}>
        {Array.from({ length: 100 }).map((_, index) => (
          <div class={styles.item}>
            Item {index}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

const HorizontalTemplate: StoryFn = (props: ScrollAreaProps) => {
  return (
    <div class={styles.background.horizontal}>
      <ScrollArea {...props} class={styles.container.horizontal}>
        {Array.from({ length: 100 }).map((_, index) => (
          <div class={styles.item}>
            Item {index}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export const Vertical = VerticalTemplate.bind({});
Vertical.args = {
  edgeSize: 16,
  fadeValue: 0,
  style: `background: white`,
};

export const Horizontal = HorizontalTemplate.bind({});
Horizontal.args = {
  edgeSize: 16,
  fadeValue: 0,
  style: `background: black`,
};
