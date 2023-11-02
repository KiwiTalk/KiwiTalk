import * as styles from './message-input.css';

import IconSend from '@/pages/main/channel/chat/_assets/icons/send.svg';

export type MessageInputProps = {
  placeholder?: string;
  onSubmit?: (message: string) => void;
};
export const MessageInput = (props: MessageInputProps) => {
  let textarea: HTMLTextAreaElement | null = null;

  const onResize = (target: HTMLTextAreaElement) => {
    textarea = target;

    target.style.height = '0';
    target.style.height = (target.scrollHeight) + 'px';
  };

  const onSubmit = (event: Event) => {
    event.preventDefault();

    const value = textarea?.value?.trim();
    if (value) {
      props.onSubmit?.(value);

      textarea!.value = '';
      onResize(textarea!);
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!event.shiftKey && event.key === 'Enter') onSubmit(event);
  };

  return (
    <form class={styles.container} onSubmit={onSubmit}>
      <textarea
        ref={onResize}
        class={styles.input}
        placeholder={props.placeholder}
        onInput={(event) => onResize(event.target)}
        onKeyDown={onKeyDown}
      />
      <button class={styles.button}>
        <IconSend />
      </button>
    </form>
  );
};
