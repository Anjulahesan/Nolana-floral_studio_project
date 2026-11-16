const { Schema, model } = require("mongoose");

// sequence generator - "order-2026"
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.next = async function (name) {
  const doc = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );
  return doc.seq;
};

// Collection name: "counters"
module.exports = model("Counter", counterSchema);
