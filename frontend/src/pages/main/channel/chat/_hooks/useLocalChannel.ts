import { ChannelUser, ClientChannel } from '@/api/client';
import { Accessor, createContext, useContext } from 'solid-js';

export const LocalChannelContext = createContext<{
  channel: Accessor<ClientChannel | null>;
  members: Accessor<Record<string, ChannelUser>>;
}>({
  channel: () => null,
  members: () => ({}),
});
export const useLocalChannel = () => useContext(LocalChannelContext);
