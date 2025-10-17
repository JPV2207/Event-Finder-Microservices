// Import user repository functions for database operations
import * as userRepository from "../repositories/userRepository.js";

// Import JSON Web Token library for generating tokens
import jwt from "jsonwebtoken";

/**
 * Registers a new user
 * @param {Object} userData - User data (username, email, password, role)
 * @returns {Promise<Object>} The created user document
 * @throws {Error} If email is already in use
 */
export const registerUser = async (userData) => {
  // Check if a user with the provided email already exists
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) throw new Error("Email already in use");

  // Create and save the new user (password hashing handled by User model)
  return await userRepository.createUser(userData);
};

/**
 * Logs in a user and generates a JWT token
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Object containing the JWT token
 * @throws {Error} If email or password is invalid
 */
export const loginUser = async (email, password) => {
  // Fetch user by email
  const user = await userRepository.findUserByEmail(email);

  // Validate user existence and password
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token with user ID and role, valid for 7 days
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );

  // Return the token
  return { token };
};

/**
 * Retrieves a user's profile by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} The user document or null if not found
 */
export const getUserProfile = async (id) => {
  // Fetch user by ID using the repository
  return await userRepository.findUserById(id);
};

/**
 * Updates a user's role
 * @param {string} userId - ID of the user to update
 * @param {string} role - New role (e.g., 'user', 'organizer', 'admin')
 * @returns {Promise<Object>} The updated user document
 * @throws {Error} If user is not found
 */
export const updateUserRole = async (userId, role) => {
  // Fetch user by ID
  const user = await userRepository.findUserById(userId);
  if (!user) throw new Error("User not found");

  // Update the user's role
  user.role = role;

  // Save and return the updated user
  return await user.save();
};
