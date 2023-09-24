import { For, JSX, ParentProps, Show, children } from 'solid-js';
import { styled } from '../../utils';
import { container, contentList, head, headContainer, name } from './index.css';

const Container = styled('div', container);
const Head = styled('div', head);
const Name = styled('span', name);
const HeadContainer = styled('div', headContainer);
const ContentList = styled('ul', contentList);
const ContentItem = styled('li', contentList);

export type SideMenuProp = ParentProps<{
  name: string,
  headContents?: JSX.Element,
  class?: string,
}>;

export const SideMenu = (props: SideMenuProp) => {
  const resolved = children(() => props.children);
  const childList = () => {
    const result = resolved();

    return Array.isArray(result) ? result : [result];
  };

  return <Container class={props.class}>
    <Head>
      <Name>{props.name}</Name>
      <Show when={props.headContents}>
        <HeadContainer>
          {props.headContents}
        </HeadContainer>
      </Show>
    </Head>
    <Show when={childList().length > 0}>
      <ContentList>
        <For each={childList()}>
          {(child) => <ContentItem>{child}</ContentItem>}
        </For>
      </ContentList>
    </Show>
  </Container>;
};
