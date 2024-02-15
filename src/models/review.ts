import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  room_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  review: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReviewModel = model("Review", reviewSchema);

export { ReviewModel as Review };

