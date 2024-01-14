import { Schema, model } from "mongoose";

enum UserRole {
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
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CLIENT,
  },
  client_data: {
    type: Map,
    of: String,
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

const User = model("User", userSchema);

export { User, UserRole };
