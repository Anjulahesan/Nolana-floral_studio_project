const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["customer", "admin"];

const contactSchema = new Schema({
    type: { type: String, enum: ["mobile", "phone", "email", "whatsapp"], required: true },
    value: { type: String, required: true, trim: true },
});

const addressSchema = new Schema ({
    label: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema(
  {
    fname: { type: String, required: true, trim: true },
    lname: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
        "Please provide a valid email address"],
    },
    
    password: { type: String, required: true, minlength: [8, "Password must be at least 8 characters"], select: false },
    role: { type: String, enum: ROLES, default: "customer" },
    contacts: [contactSchema],
    addresses: [addressSchema],
  },

  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Collection name: "users"
module.exports = model("User", userSchema);
module.exports.ROLES = ROLES;