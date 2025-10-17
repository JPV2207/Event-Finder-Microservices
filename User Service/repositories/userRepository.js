// Import User model for MongoDB operations
import User from "../models/user.js";

/**
 * Creates a new user in the database
 * @param {Object} userData - User data (e.g., username, email, password, role)
 * @returns {Promise<Object>} The created user document
 */
export const createUser = async (userData) => {
  // Create a new User instance with provided data
  const user = new User(userData);

  // Save the user to the database (password hashing handled by User schema pre-save middleware)
  return await user.save();
};

/**
 * Finds a user by their email address
 * @param {string} email - Email address of the user
 * @returns {Promise<Object|null>} The user document or null if not found
 */
export const findUserByEmail = async (email) => {
  // Query for a user with the specified email
  return await User.findOne({ email });
};

/**
 * Finds a user by their ID
 * @param {string} id - ID of the user
 * @returns {Promise<Object|null>} The user document or null if not found
 */
export const findUserById = async (id) => {
  // Query for a user with the specified MongoDB ObjectId
  return await User.findById(id);
};
