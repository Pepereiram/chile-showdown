import mongoose, { Schema } from 'mongoose';

interface IUser {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;