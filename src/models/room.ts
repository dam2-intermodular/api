import { Schema, model } from "mongoose";

const roomSchema = new Schema({
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
    default: null,
  },

  description: {
    type: String,
    required: true,
  },

  services: {
    type: Array,
    required: true,
  },

  availability: {
    type: [
      {
        check_in_date: Date,
        check_out_date: Date,
        booking_id: Schema.Types.ObjectId,
      },
    ],
    default: [],
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
