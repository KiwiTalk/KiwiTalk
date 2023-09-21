import { ParentProps } from 'solid-js';
import I18nProvider from './i18n';
import ConfigurationProvider from './configuration';

const Provider = (props: ParentProps) => {
  return (
    <I18nProvider>
      <ConfigurationProvider>
        {props.children}
      </ConfigurationProvider>
    </I18nProvider>
  );
};

export default Provider;
