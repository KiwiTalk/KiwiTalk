import { ComponentProps, ParentProps, ValidComponent, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export const styled = <T extends ValidComponent, Props extends ComponentProps<T>>(
  component: T,
  className: string,
) => {
  return (props: ParentProps<Props> & { class?: string }) => {
    const [local, leftProps] = splitProps(props, ['children', 'class']);

    const newClass = () => local.class ? `${className} ${local.class}` : className;
    return (
      <Dynamic {...leftProps} component={component as ValidComponent} class={newClass()}>
        {local.children}
      </Dynamic>
    );
  };
};
