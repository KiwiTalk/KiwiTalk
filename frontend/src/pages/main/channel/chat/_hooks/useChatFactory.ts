import { Accessor, createContext, useContext } from 'solid-js';
import { ChatFactory } from '../_utils/chat-factory';

export const ChatFactoryContext = createContext<Accessor<ChatFactory | null>>(() => null);
export const useChatFactory = () => useContext(ChatFactoryContext);
