const { Schema, model, Types } = require("mongoose");

const sizeSchema = new Schema(
  {
    label: { type: String, required: true, trim: true }, 
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Category 1 --- M Product  (reference)
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },

    flowers: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true, lowercase: true }],
    occasions: [{ type: String, trim: true }],
    sizes: {
      type: [sizeSchema],
      validate: [(v) => v.length > 0, "At least one size/price is required"],
    },
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ name: "text", description: "text", flowers: "text" });


module.exports = model("Product", productSchema);
