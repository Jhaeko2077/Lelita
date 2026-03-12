export type User = { email: string; password: string };

export type MediaItem = {
  id: string;
  url: string;
  type: string;
  description: string;
  author: string;
  createdAt: number;
};

export type Letter = {
  id: string;
  title: string;
  text: string;
  to: 'jeicob' | 'lelita';
  author: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  author: string;
  createdAt: number;
};

export type ResetCode = {
  code: string;
  expires: number;
};

export type AppState = {
  users: Record<string, User>;
  resetCodes: Record<string, ResetCode>;
  phrase: string;
  theme: 'day' | 'night';
  media: MediaItem[];
  letters: Letter[];
  chat: ChatMessage[];
};
