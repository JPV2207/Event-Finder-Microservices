// Import Express framework for building the server
import express from "express";

// Import Mongoose for MongoDB database interactions
import mongoose from "mongoose";

// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Import event routes for handling event-related API endpoints
import eventRoutes from "./routes/event.js";

// Load environment variables from .env file into process.env
dotenv.config();

// Define MongoDB connection URI, defaulting to local event-service database
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/event-service";

// Initialize the Express application
const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Health-check endpoint to verify the service is running
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Event Service is running" });
});

// Connect to MongoDB database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    // Log success message when MongoDB connection is established
    console.log("Event Service MongoDB connected");
  })
  .catch((err) => {
    // Log MongoDB connection errors for debugging
    console.error("MongoDB connection error:", err);
  });

// Mount event routes under the /api/events prefix
app.use("/api/events", eventRoutes);

// Set the port from environment variable or default to 6000
const PORT = process.env.PORT || 6000;

// Start the server and log the port it's running on
app.listen(PORT, () => {
  console.log(`Event service running on port ${PORT}`);
});
