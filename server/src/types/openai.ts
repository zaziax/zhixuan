import 'openai';

declare module 'openai' {
  interface ChatCompletionChunkChoice {
    delta: {
      content: string | null;
      role?: string;
      reasoning_content?: string;
    }
  }
} 