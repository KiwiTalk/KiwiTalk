import { Trans } from '@jellybrick/solid-i18next';

import { Button } from '@/ui-common/button';
import { Input } from '@/ui-common/input';

import * as styles from './passcode.css';

import type { JSX } from 'solid-js';

export type PasscodeProps = {
  onSubmit?: (passcode: string) => void;
};
export const Passcode = (props: PasscodeProps) => {
  const onNextInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    const input = event.currentTarget;
    const nextInput = input.parentElement?.nextElementSibling as HTMLInputElement | null;
    const prevInput = input.parentElement?.previousElementSibling as HTMLInputElement | null;

    input.value = input.value.replace(/[^0-9]/g, '').at(-1) ?? '';

    if (input.value.length > 0 && nextInput) {
      nextInput.focus();
    }
    if (input.value.length === 0 && prevInput) {
      prevInput.focus();
    }
  };

  const onSubmit: JSX.EventHandlerUnion<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    let passcode = '';
    for (let i = 0; i < 4; i += 1) {
      passcode += formData.get(`passcode${i + 1}`) ?? '';
    }

    props.onSubmit?.(passcode);
  };

  return (
    <form class={styles.container} onSubmit={onSubmit}>
      <h3 class={styles.placeholder}>
        <Trans key={'login.passcode_placeholder'} />
      </h3>
      <div class={styles.codeContainer}>
        <Input
          name={'passcode1'}
          class={styles.codeInput}
          placeholder={'-'}
          onInput={onNextInput}
        />
        <Input
          name={'passcode2'}
          class={styles.codeInput}
          placeholder={'-'}
          onInput={onNextInput}
        />
        <Input
          name={'passcode3'}
          class={styles.codeInput}
          placeholder={'-'}
          onInput={onNextInput}
        />
        <Input
          name={'passcode4'}
          class={styles.codeInput}
          placeholder={'-'}
          onInput={onNextInput}
        />
      </div>
      <Button>
        <Trans key={'common.ok'} />
      </Button>
    </form>
  );
};
