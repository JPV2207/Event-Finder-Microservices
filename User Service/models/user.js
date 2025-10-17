// Import Mongoose for defining MongoDB schemas and models
import mongoose from "mongoose";

// Import bcrypt for password hashing
import bcrypt from "bcrypt";

// Define the User schema for storing user data
const userSchema = new mongoose.Schema({
  // Username of the user
  username: {
    type: String,
    required: true, // Username is mandatory
    unique: true, // Ensure username is unique
    trim: true, // Remove leading/trailing whitespace
  },
  // Email address of the user
  email: {
    type: String,
    required: true, // Email is mandatory
    unique: true, // Ensure email is unique
    trim: true, // Remove leading/trailing whitespace
    lowercase: true, // Convert email to lowercase
  },
  // Hashed password of the user
  password: {
    type: String,
    required: true, // Password is mandatory
  },
  // User role with predefined values
  role: {
    type: String,
    enum: ["admin", "organizer", "user"], // Restrict to specific roles
    default: "user", // Default role is 'user'
  },
  // Date the user was created
  createdAt: {
    type: Date,
    default: Date.now, // Set to current date/time on creation
  },
});

/**
 * Pre-save middleware to hash the password before saving
 * @param {Function} next - Mongoose next middleware function
 */
userSchema.pre("save", async function (next) {
  // Skip hashing if password hasn't been modified
  if (!this.isModified("password")) return next();

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Proceed to save the document
  next();
});

/**
 * Method to compare a candidate password with the stored hash
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Compare candidate password with stored hashed password
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model for the 'User' collection
const User = mongoose.model("User", userSchema);

export default User;
