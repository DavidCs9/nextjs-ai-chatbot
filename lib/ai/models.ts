export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'GPT-4o',
    description: 'Primary OpenAI model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'o1-mini',
    description: 'OpenAI reasoning model with advanced capabilities',
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    description: 'OpenAI GPT-4.1 model',
  },
];
