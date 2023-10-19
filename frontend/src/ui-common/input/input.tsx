import { JSX, Show, splitProps } from 'solid-js';

import * as styles from './input.css';

export type InputProps = JSX.HTMLAttributes<HTMLInputElement> & {
  icon?: JSX.Element;
  placeholder?: string;
};
export const Input = (props: InputProps) => {
  const [local, inputProps] = splitProps(props, ['icon']);

  return (
    <label class={styles.container}>
      <Show when={local.icon}>
        <div class={styles.iconWrapper}>
          {local.icon}
        </div>
      </Show>
      <input
        {...inputProps}
        classList={{
          [styles.input]: true,
          // [styles.selected]: local.selected,
          ...inputProps.classList,
        }}
      />
    </label>
  );
};
