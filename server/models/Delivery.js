
const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryDate: {
      type: Date,
      required: true,
    },

    items: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "on_the_way",
        "delivered",
      ],
      default: "pending",
    },

    confirmationTokenHash: {
      type: String,
      default: null,
    },

    tokenExpiresAt: {
      type: Date,
      default: null,
    },

    estimatedArrival: {
      type: Date,
      default: null,
    },

    deliveryPhoto: {
      type: String,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
