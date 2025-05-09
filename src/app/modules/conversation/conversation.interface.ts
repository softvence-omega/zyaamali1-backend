import { Types } from "mongoose";

export type TCard = {
  title: string;
  description?: string;
  type: "image" | "video";
  file: string;
  price: number;
};

export type TPrompt = {
  type: "text" | "audio" | "video" | "image" | "document";
  content: string;
};

export type TResponse = {
  type: "text" | "audio" | "video" | "image" | "document" | "card";
  isCard: boolean;
  content?: string;
  cardContent?: TCard[];
};

export type TMessage = {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  prompt: TPrompt[];
  enhancedPrompt?: string;
  response: TResponse[];
};

export type TConversation = {
  name: string;
  userId: Types.ObjectId;
  chat: Types.ObjectId[];
};
