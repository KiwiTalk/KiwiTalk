import { Trans } from '@jellybrick/solid-i18next';

import IconEmpty1 from '../../_assets/icons/empty1.png';
import IconEmpty2 from '../../_assets/icons/empty2.png';
import IconEmpty3 from '../../_assets/icons/empty3.png';
import IconEmpty4 from '../../_assets/icons/empty4.png';
import IconEmpty5 from '../../_assets/icons/empty5.png';
import IconEmpty6 from '../../_assets/icons/empty6.png';
import IconEmpty7 from '../../_assets/icons/empty7.png';
import IconEmpty8 from '../../_assets/icons/empty8.png';
import IconEmpty9 from '../../_assets/icons/empty9.png';

import * as styles from './chat-empty.css';

const IconList = [
  IconEmpty1,
  IconEmpty2,
  IconEmpty3,
  IconEmpty4,
  IconEmpty5,
  IconEmpty6,
  IconEmpty7,
  IconEmpty8,
  IconEmpty9,
];

export const ChatEmpty = () => {
  const icon = IconList[Math.floor(Math.random() * IconList.length)];

  return (
    <div class={styles.container}>
      <img class={styles.icon} src={icon} />
      <div class={styles.text.title}>
        <Trans key={'main.chat.empty.title'} />
      </div>
      <div class={styles.text.subtitle}>
        <Trans key={'main.chat.empty.subtitle'} />
      </div>
    </div>
  );
};
