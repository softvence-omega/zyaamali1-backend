import { Types } from "mongoose";


export type TCard ={
  title: string;
  description?: string;
  type: "image" | "video";
  file: string;
  price: number;
}

export type TResponse = {
  type: "text" | "audio" | "video" | "image" ;
  content: string;
};

export type TCardResponse = {
  type: "card"
  content: TCard[]; 
};


export type TMessage = {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  prompt: TResponse[];
  response: (TCardResponse | TResponse)[];
};

export type TConversation = {
  name: string;
  userId: Types.ObjectId;
  chat: Types.ObjectId[];
};

