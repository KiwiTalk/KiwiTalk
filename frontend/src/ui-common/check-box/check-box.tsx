import { JSX, splitProps } from 'solid-js';

import IconCheck from './_assets/check.svg';

import * as styles from './check-box.css';

export type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const CheckBox = (props: CheckBoxProps) => {
  const [local, inputProps] = splitProps(props, ['class', 'classList']);

  const variant = () => inputProps.checked ? 'checked' : 'unchecked';
  const classList = () => {
    const list = {
      [styles.input]: true,
      ...local.classList,
    };

    if (local.class) list[local.class] = true;

    return list;
  };

  return (
    <label class={styles.container}>
      <div class={styles.iconWrapper[variant()]}>
        <IconCheck class={styles.icon[variant()]} />
      </div>
      <input
        {...inputProps}
        type={'checkbox'}
        classList={classList()}
      />
      {props.children}
    </label>
  );
};
