import mongoose from "mongoose";
export interface IUser {
  username: string;
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  likedPosts?: mongoose.Schema.Types.ObjectId[]; 
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
    },  //liked with post id
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;