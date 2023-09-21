import i18next from 'i18next';
import { Decorator } from 'storybook-solidjs';

import type { JSX } from 'solid-js/jsx-runtime';
import Provider from '../frontend/src/app/providers';
import { useTransContext } from '@jellybrick/solid-i18next';
import { Globals } from '@storybook/types';
import { ParentProps } from 'solid-js';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en-US', right: '🇺🇸', title: 'English' },
        { value: 'ko-KR', right: '🇰🇷', title: '한국어' },
      ],
    },
  },
};

type StoryProviderProps = ParentProps<{
  globals: Globals;
}>;

const StoryProvider = (props: StoryProviderProps) => {
  const [, { changeLanguage }] = useTransContext();
  if (props.globals.locale !== i18next.language) changeLanguage(props.globals.locale);

  return props.children;
};

export const decorators: Decorator[] = [
  (Story: () => JSX.Element, { globals }) => (
    <Provider>
      <StoryProvider globals={globals}>
        <Story />
      </StoryProvider>
    </Provider>
  ),
];
