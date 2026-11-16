require("dotenv").config({ quiet: true });

const app = require("./app");
const { connectDB } = require("./config/config");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set. Please check your .env file!");
    }

    // Connect to DB
    await connectDB(process.env.MONGODB_URI);

    // Server 
    app.listen(PORT, () => {
      console.log(`Nolana Floral Studio API listening on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
})();