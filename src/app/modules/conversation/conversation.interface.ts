import { Types } from "mongoose";

export type ContentType = "text" | "audio" | "video" | "image";

export type TContent = {
  type: ContentType;
  content: string; // URL for media or plain text
};

export type TMessage = {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  prompt: TContent;
  response: TContent;
};

export type TConversation = {
  name: string;
  userId: Types.ObjectId;
  chat: Types.ObjectId[];
};
