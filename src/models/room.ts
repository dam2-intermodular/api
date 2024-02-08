import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  room_number: {
    type: Number,
    required: true,
  },

  beds: {
    type: Number,
    required: true,
  },
  price_per_night: {
    type: Number,
    required: true,
  },
  image_path: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  services: {
    type: Array,
    required: true,
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

const Room = model("Room", roomSchema);

export { Room };
