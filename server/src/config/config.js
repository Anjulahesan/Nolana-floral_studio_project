const mongoose = require("mongoose");
const models = require("../models");

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Please check your .env file!");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("Database connected...");

  // Check the indexes are created
  for (const Model of Object.values(models)) {
    await Model.init();
  }

  console.log(
    `Collections ready: ${Object.values(models)
      .map((m) => m.collection.name)
      .join(", ")}`
  );
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("Database disconnected");
}

module.exports = { connectDB, disconnectDB };