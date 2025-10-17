// Import Mongoose for defining MongoDB schemas and models
import mongoose from "mongoose";

// Define the OrganizerApplication schema for storing organizer applications
const organizerApplicationSchema = new mongoose.Schema(
  {
    // Reference to the user submitting the application
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User collection
      required: true, // User ID is mandatory
      unique: true, // Ensure one application per user
    },
    // Full name of the applicant
    fullName: {
      type: String,
      required: true, // Full name is mandatory
      trim: true, // Remove leading/trailing whitespace
    },
    // Name of the organization
    organizationName: {
      type: String,
      required: true, // Organization name is mandatory
      trim: true, // Remove leading/trailing whitespace
    },
    // Contact number of the applicant
    contactNumber: {
      type: String,
      required: true, // Contact number is mandatory
    },
    // Optional description of the application
    description: {
      type: String,
      default: "", // Default to empty string if not provided
    },
    // Application status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Restrict to specific statuses
      default: "pending", // Default to pending when created
    },
    // Reason for rejection (if applicable)
    rejectionReason: {
      type: String,
      default: "", // Default to empty string if not provided
    },
    // Date the application was submitted
    submittedAt: {
      type: Date,
      default: Date.now, // Set to current date/time on creation
    },
    // Date the application was reviewed (optional)
    reviewedAt: {
      type: Date, // Set when application is approved or rejected
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the OrganizerApplication model for the 'OrganizerApplication' collection
const OrganizerApplication = mongoose.model(
  "OrganizerApplication",
  organizerApplicationSchema
);

export default OrganizerApplication;
