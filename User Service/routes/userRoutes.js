// Import Express for creating the router
import express from "express";

// Import controller functions for user-related operations
import { register, login, getProfile, updateRole } from "../controllers/userController.js";

// Import middleware to verify JWT tokens
import auth from "../middlewares/auth.js";

// Import middleware to restrict access to specific roles
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

// Initialize Express router for user routes
const router = express.Router();

/**
 * POST /api/users/signup
 * Registers a new user
 */
router.post("/signup", register); // Handle user registration

/**
 * POST /api/users/login
 * Logs in a user and returns a JWT token
 */
router.post("/login", login); // Handle user login

/**
 * GET /api/users/profile
 * Retrieves the authenticated user's profile
 */
router.get("/profile", 
  auth, // Verify JWT token
  getProfile // Handle fetching user profile
);

/**
 * PATCH /api/users/:userId
 * Updates a user's role (admin-only)
 */
router.patch(
  "/:userId",
  auth, // Verify JWT token
  authorizeRoles(["admin"]), // Restrict to admin role
  updateRole // Handle updating user role
);

// Export the router for use in the main server file
export default router;
