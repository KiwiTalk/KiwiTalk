import { StoryFn } from 'storybook-solidjs';

import { VirtualList } from './virtual-list';
import { createMemo } from 'solid-js';
import * as styles from './virtual-list.stories.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

export default {
  title: 'KiwiTalk v2/ui/Virtual List',
  component: VirtualList,
};

type VirtualListStoryProps = {
  listLength: number;
  enableRandomHeight: boolean;
};
const Template: StoryFn<VirtualListStoryProps> = (props) => {
  const list = createMemo(
    () => Array
      .from({ length: props.listLength })
      .map((_, index) => ({
        name: `Item ${index + 1}`,
        height: props.enableRandomHeight ? Math.floor(Math.random() * 200) + 50 : 50,
        image: 'https://picsum.photos/200?random=' + index,
      })),
  );

  return (
    <div class={styles.background}>
      <VirtualList items={list()} class={styles.container}>
        {(item) => (
          <div
            class={styles.item}
            style={assignInlineVars({
              [styles.height]: item.height + 'px',
            })}
          >
            {item.name}
          </div>
        )}
      </VirtualList>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  listLength: 1000,
  enableRandomHeight: false,
};
