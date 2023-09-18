import { ComponentProps, ParentProps, ValidComponent, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export const styled = <T extends ValidComponent, Props extends ComponentProps<T>>(
  component: T,
  className: string,
) => {
  return (props: ParentProps<Props>) => {
    const [local, leftProps] = splitProps(props, ['children']);

    return (
      <Dynamic {...leftProps} component={component as ValidComponent} class={className}>
        {local.children}
      </Dynamic>
    );
  };
};
