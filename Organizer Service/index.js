// Import Express framework for building the server
import express from "express";

// Import Mongoose for MongoDB database interactions
import mongoose from "mongoose";

// Import CORS middleware to enable cross-origin resource sharing
import cors from "cors";

// Import Morgan middleware for logging HTTP requests
import morgan from "morgan";

// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Import organizer routes for handling organizer-related API endpoints
import organizerRoutes from "./routes/organizerRoutes.js";

// Load environment variables from .env file into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Enable CORS for all routes to allow requests from different origins
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Log HTTP requests in development format for debugging
app.use(morgan("dev"));

// Mount organizer routes under the /api prefix
app.use("/api", organizerRoutes);

// Health-check endpoint to verify the service is running
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Organizer Service is running" });
});

/**
 * Starts the server and connects to MongoDB
 * Exits the process on connection failure
 */
const start = async () => {
  try {
    // Connect to MongoDB using the specified URI and database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "event-finder-organizers", // Use specific database for organizer service
    });
    console.log("MongoDB connected for Organizer Service");

    // Set the port from environment variable or default to 8000
    const port = process.env.PORT || 8000;

    // Start the server and log the port it's running on
    app.listen(port, () =>
      console.log(`Organizer Service running on port ${port}`)
    );
  } catch (err) {
    // Log MongoDB connection errors and exit process with failure status
    console.error(err);
    process.exit(1);
  }
};

// Initiate the server startup
start();
