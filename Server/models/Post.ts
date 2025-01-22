import mongoose from "mongoose";
import Comment from "./Comment";
export interface IPost {
  title: string;
  content: string;
  senderId: string;
  createdAt?: Date;
  comments?:mongoose.Schema.Types.ObjectId[];
}
const postSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
});
const postModel = mongoose.model<IPost>("Post", postSchema);

export default postModel;
