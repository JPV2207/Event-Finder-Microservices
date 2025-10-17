// Load environment variables from .env file into process.env
import dotenv from "dotenv";
dotenv.config();

// Import Express framework for building the server
import express from "express";

// Import CORS middleware to enable cross-origin resource sharing
import cors from "cors";

// Import Morgan middleware for logging HTTP requests
import morgan from "morgan";

// Import admin routes for handling admin-related API endpoints
import adminRoutes from "./routes/admin.js";

// Initialize the Express application
const app = express();

// Enable CORS for all routes to allow requests from different origins
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Log HTTP requests in development format for debugging
app.use(morgan("dev"));

// Mount admin routes under the /api prefix
app.use("/api", adminRoutes);

// Health-check endpoint to verify the service is running
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Admin Service is running" });
});

// Set the port from environment variable or default to 7000
const port = process.env.PORT || 7000;

// Start the server and log the port it's running on
app.listen(port, () => console.log(`Admin Service listening on: ${port}`));
