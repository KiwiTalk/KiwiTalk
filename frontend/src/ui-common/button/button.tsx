import { JSX, ParentProps, mergeProps, splitProps } from 'solid-js';

import * as styles from './button.css';

export type ButtonProps = ParentProps<JSX.HTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'text' | 'glass';
}>;
export const Button = (props: ButtonProps) => {
  const [local, buttonProps] = splitProps(mergeProps({ variant: 'primary' }, props), ['variant']);

  return (
    <button
      {...buttonProps}
      classList={{
        [styles.button.primary]: local.variant === 'primary',
        [styles.button.secondary]: local.variant === 'secondary',
        [styles.button.text]: local.variant === 'text',
        [styles.button.glass]: local.variant === 'glass',
      }}
    >
      {props.children}
    </button>
  );
};
