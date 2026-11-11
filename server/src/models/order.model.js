const { Schema, model, Types } = require("mongoose");

const ORDER_STATUSES = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot at order time
    size: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // snapshot at order time
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const deliverySchema = new Schema(
  {
    recipientName: { type: String, required: true, trim: true },
    recipientPhone: { type: String, required: true, trim: true },
    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, trim: true }, // Example: "10:00-12:00"
    fee: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },
    delivery: { type: deliverySchema, required: true },
    cardMessage: { type: String, trim: true, maxlength: 300 },

    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    payment: {
      method: { type: String, enum: ["cash", "card", "bank_transfer"], default: "cash" },
      status: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ "delivery.date": 1, status: 1 });

module.exports = model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
 