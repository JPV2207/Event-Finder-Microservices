// Import Mongoose for MongoDB database interactions
import mongoose from "mongoose";

// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Import User model for creating admin user
import User from "../models/user.js"; // Path to User model in user-service/models/user.js

// Load environment variables from .env file into process.env
dotenv.config();

/**
 * Creates an admin user in the User Service database if one doesn't exist
 * Exits the process on success (0) or failure (1)
 */
const createAdmin = async () => {
  try {
    // Connect to MongoDB using the specified URI and database name
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      dbName: "event-finder-users", // Specific database for User Service
    });

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      return process.exit(0); // Exit with success status
    }

    // Create a new admin user with credentials from environment variables
    const admin = new User({
      username: process.env.ADMIN_USERNAME, // Admin username from .env
      email: process.env.ADMIN_EMAIL, // Admin email from .env
      password: process.env.ADMIN_PASSWORD, // Password will be hashed by User model pre-save middleware
      role: "admin", // Set role to admin
    });

    // Save the admin user to the database
    await admin.save();
    console.log("Admin user created successfully:", admin.email);

    // Exit with success status
    process.exit(0);
  } catch (err) {
    // Log errors and exit with failure status
    console.error("Error creating admin user:", err.message);
    process.exit(1);
  }
};

// Run the admin creation script
createAdmin();
