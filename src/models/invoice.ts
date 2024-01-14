import { Schema, model } from "mongoose";

enum InvoiceStatus {
  PENDING = "pending",
  PAID = "paid",
}

const invoiceSchema = new Schema({
  // _id: Schema.Types.ObjectId,

  reference: {
    type: String,
    required: true,
  },

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

  status: {
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.PENDING,
  },
  billing_address: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },

  subtotal: {
    type: Number,
    required: true,
  },
  taxes: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
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

const Invoice = model("Invoice", invoiceSchema);

export { Invoice, InvoiceStatus };
