import { Schema, model } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
}

const userSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_data: {
    type: Object,
    default: {},
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CLIENT,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

export const User = model("User", userSchema);
