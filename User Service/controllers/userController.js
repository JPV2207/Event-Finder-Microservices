// Import user service for handling user-related business logic
import * as userService from "../services/userService.js";

/**
 * Registers a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
    // Register user using userService with request body data
    const user = await userService.registerUser(req.body);

    // Return success response with 201 status
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    // Handle errors with a 400 status and error message
    res.status(400).json({ message: err.message });
  }
};

/**
 * Logs in a user and returns a JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Authenticate user and get JWT token using userService
    const { token } = await userService.loginUser(email, password);

    // Return token with 200 status
    res.status(200).json({ token });
  } catch (err) {
    // Handle authentication errors with a 401 status
    res.status(401).json({ message: err.message });
  }
};

/**
 * Retrieves the profile of the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProfile = async (req, res) => {
  try {
    // Fetch user profile using userId from JWT (set by authenticateToken middleware)
    const user = await userService.getUserProfile(req.user.userId);

    // Return user profile with 200 status
    res.status(200).json(user);
  } catch (err) {
    // Handle errors (e.g., user not found) with a 404 status
    res.status(404).json({ message: "User not found" });
  }
};

/**
 * Updates the role of a user (admin-only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateRole = async (req, res) => {
  try {
    // Extract user ID from request parameters and role from request body
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role against allowed values
    if (!["user", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Update user role using userService
    const updatedUser = await userService.updateUserRole(userId, role);

    // Return success response with updated user data
    res
      .status(200)
      .json({ message: "User role updated successfully", user: updatedUser });
  } catch (err) {
    // Log errors for debugging
    console.error("Update role error:", err.message);

    // Handle errors with a 400 status
    res.status(400).json({ message: err.message });
  }
};
