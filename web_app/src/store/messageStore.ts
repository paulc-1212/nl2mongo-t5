import { Message } from "@/lib/Message";
import { create } from "zustand"

interface MessageState {
    messages: Message[];
    addMessage: (message: Message) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export const getMessageById = (id: number): Message | undefined => {
    console.log("getMessageById", useMessageStore.getState().messages);
    return useMessageStore.getState().messages.find(msg => msg.id === id);
};

export const useMessages = () => useMessageStore((state) => state.messages);

export const useAddMessage = () => useMessageStore((state) => state.addMessage);