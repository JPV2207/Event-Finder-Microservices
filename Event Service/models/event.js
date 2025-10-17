// Import Mongoose for defining MongoDB schemas and models
import mongoose from "mongoose";

// Define the Comment schema for embedded comments in the Event schema
const commentSchema = new mongoose.Schema(
  {
    // Reference to the user who made the comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User collection
      required: true, // User ID is mandatory
    },
    // Comment text content
    text: {
      type: String,
      required: true, // Comment text is mandatory
      trim: true, // Remove leading/trailing whitespace
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps for comments
    timestamps: true,
  }
);

// Define the Event schema for the events collection
const eventSchema = new mongoose.Schema(
  {
    // Event name
    name: {
      type: String,
      required: true, // Name is mandatory
      trim: true, // Remove leading/trailing whitespace
    },
    // Event description (optional)
    description: {
      type: String,
      default: "", // Default to empty string if not provided
    },
    // Event category with predefined options
    category: {
      type: String,
      enum: ["music", "food", "sports", "tech", "other"], // Restrict to specific categories
      default: "other", // Default category if not specified
    },
    // Event date
    date: {
      type: Date,
      required: true, // Date is mandatory
    },
    // Event price
    price: {
      type: Number,
      required: true, // Price is mandatory
      min: 0, // Ensure price is non-negative
    },
    // City where the event takes place
    city: {
      type: String,
      required: true, // City is mandatory
      trim: true, // Remove leading/trailing whitespace
      index: true, // Add index for faster queries on city
    },
    // Location details (address and place ID)
    location: {
      address: {
        type: String,
        default: "", // Default to empty string if not provided
      },
      placeId: {
        type: String,
        default: "", // Default to empty string if not provided (e.g., Google Maps Place ID)
      },
    },
    // Reference to the user who created the event
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User collection
      required: true, // User ID is mandatory
    },
    // List of users who liked the event
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Links to the User collection
      },
    ],
    // Embedded list of comments on the event
    comments: [commentSchema],
  },
  {
    // Automatically add createdAt and updatedAt timestamps for events
    timestamps: true,
  }
);

// Create and export the Event model, using the 'events' collection
const Event = mongoose.model("Event", eventSchema, "events");

export default Event;
