export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};
  
export type Conversation = {
    id: string;
    name: string;
    messages: Message[];
    createdAt: string;
};
