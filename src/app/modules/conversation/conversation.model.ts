import { Schema, model, Types } from "mongoose";
import { TContent, TConversation, TMessage } from "./conversation.interface";

const ContentSchema = new Schema<TContent>(
  {
    type: {
      type: String,
      enum: ["text", "audio", "video", "image"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema<TMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    prompt: {
      type: ContentSchema,
      required: true,
    },
    response: {
      type: ContentSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationSchema = new Schema<TConversation>(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = model("Message", MessageSchema);
export const Conversation = model("Conversation", ConversationSchema);
