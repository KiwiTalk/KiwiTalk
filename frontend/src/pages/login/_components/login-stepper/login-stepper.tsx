import { Show, For, mergeProps, JSX } from 'solid-js';
import { Transition, TransitionGroup } from 'solid-transition-group';
import { useTransContext } from '@jellybrick/solid-i18next';

import { classes } from '@/features/theme';
import { Button } from '@/ui-common/button';

import * as styles from './login-stepper.css';

type Step = {
  id: string;
  title: string;
  icon: JSX.Element;
};
export type LoginStepperProps = {
  enableBack?: boolean;

  steps?: Step[];
  step?: string;

  onBack?: () => void;
};
export const LoginStepper = (props: LoginStepperProps) => {
  const local = mergeProps({ steps: [] }, props);

  const [t] = useTransContext();

  const index = () => local.steps.findIndex((step) => step.id === props.step);
  const nowStep = () => local.steps?.[index()];
  const titles = () => local.steps.slice(0, index() + 1).map((step) => step.title).reverse();

  return (
    <div class={styles.infoContainer}>
      <Show when={index() >= 0}>
        <div class={styles.iconWrapper}>
          <Transition mode={'outin'} {...classes.transition.toUp}>
            {nowStep().icon}
          </Transition>
        </div>
        <TransitionGroup {...classes.transition.toUp}>
          <For each={titles()}>
            {(title, index) => (
              <h1 class={index() === 0 ? styles.infoTitle.main : styles.infoTitle.other}>
                {title}
              </h1>
            )}
          </For>
        </TransitionGroup>
        <Show when={props.enableBack}>
          <Button
            variant={'glass'}
            onClick={local.onBack}
            style={'margin-top: auto;'}
          >
            {t('common.prev')}
          </Button>
        </Show>
      </Show>
    </div>
  );
};
