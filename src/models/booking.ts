import { Schema, model } from "mongoose";

enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

const bookingSchema = new Schema({
  // _id: Schema.Types.ObjectId,

  room_id: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  invoice_id: {
    type: Schema.Types.ObjectId,
    ref: "Invoice",
  },

  check_in_date: {
    type: Date,
    required: true,
  },
  check_out_date: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
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

const Booking = model("Booking", bookingSchema);

export { Booking, BookingStatus };
