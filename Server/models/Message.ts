import mongoose from "mongoose";

export interface IMessage {
  from: mongoose.Schema.Types.ObjectId;
  to: mongoose.Schema.Types.ObjectId;
  message: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export { Message };
