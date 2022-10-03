import '../frontend/src/app/env';

import i18next from 'i18next';
import React from 'react';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

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

export const decorators = [
  (Story: () => JSX.Element, { globals }) => {
    if (globals.locale !== i18next.language) {
      i18next.changeLanguage(globals.locale);
    }

    return <Story />;
  },
];
