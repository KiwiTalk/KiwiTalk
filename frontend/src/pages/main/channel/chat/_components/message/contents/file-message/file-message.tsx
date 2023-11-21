import { filesize } from 'filesize';
import { useTransContext } from '@jellybrick/solid-i18next';

import IconPhoto from '@/pages/main/channel/chat/_assets/icons/photo.svg';
import IconMusic from '@/pages/main/channel/chat/_assets/icons/music.svg';
import IconText from '@/pages/main/channel/chat/_assets/icons/text.svg';
import IconPieChart from '@/pages/main/channel/chat/_assets/icons/pie_chart.svg';
import IconChart from '@/pages/main/channel/chat/_assets/icons/chart.svg';
import IconFile from '@/pages/main/channel/chat/_assets/icons/file.svg';

import * as styles from './file-message.css';
import { Show } from 'solid-js';
import { Loader } from '@/ui-common/loader';

export type FileMessageProps = {
  mimeType: string;
  fileName?: string;
  fileSize?: number;
  expire?: number;
};
export const FileMessage = (props: FileMessageProps) => {
  const [t] = useTransContext();

  const icon = () => {
    if (props.mimeType.startsWith('image/')) return <IconPhoto />;
    if (props.mimeType.startsWith('audio/')) return <IconMusic />;
    if (props.mimeType.startsWith('video/')) return <IconPhoto />;
    if (props.mimeType.startsWith('text/')) return <IconText />;
    if (props.mimeType.startsWith('application/vnd.ms-powerpoint')) return <IconPieChart />;
    const office = [
      'application/vnd.ms-excel',
      'application/vnd.ms-word',
      'application/vnd.openxmlformats-officedocument',
      'application/vnd.oasis.opendocument',
      'application/pdf',
    ];
    if (office.includes(props.mimeType)) return <IconChart />;

    return <IconFile />;
  };

  const descriptableType = () => {
    let type = 'file';

    if (props.mimeType.startsWith('image/')) type = 'image';
    if (props.mimeType.startsWith('audio/')) type = 'audio';
    if (props.mimeType.startsWith('video/')) type = 'video';
    if (props.mimeType.startsWith('text/')) type = 'text';
    if (props.mimeType.startsWith('application/vnd.ms-excel')) type = 'spreadsheet';
    if (props.mimeType.startsWith('application/vnd.ms-powerpoint')) type = 'presentation';
    if (props.mimeType.startsWith('application/vnd.ms-word')) type = 'document';
    if (props.mimeType.startsWith('application/vnd.openxmlformats-officedocument')) type = 'office';
    if (props.mimeType.startsWith('application/vnd.oasis.opendocument')) type = 'office';
    if (props.mimeType.startsWith('application/pdf')) type = 'document';

    return t(`main.chat.attachment.${type}`);
  };

  return (
    <div class={styles.container}>
      <div class={styles.iconWrapper}>
        {icon()}
      </div>
      <div class={styles.content}>
        <div class={styles.title}>
          <Show when={props.fileName} fallback={<Loader />}>
            {props.fileName}
          </Show>
        </div>
        <div class={styles.infoContainer}>
          <span>
            {descriptableType()}
          </span>
          <div class={styles.infoDivider} />
          <Show when={props.fileSize}>
            <span>
              {filesize(props.fileSize!, { standard: 'jedec' })}
            </span>
          </Show>
          <div class={styles.infoDivider} />
          <Show when={props.expire}>
            <span>
              ~ {new Date(props.expire!).toLocaleDateString()}
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
};
