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
  reverse: boolean;
  alignToBottom: boolean;
  topMargin: number;
  bottomMargin: number;
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
      <VirtualList
        component={'div'}
        items={list()}
        class={styles.container}
        reverse={props.reverse}
        topMargin={props.topMargin}
        bottomMargin={props.bottomMargin}
        alignToBottom={props.alignToBottom}
      >
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
  reverse: false,
  alignToBottom: false,
  topMargin: 0,
  bottomMargin: 0,
};
