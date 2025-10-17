// Import Express for creating the router
import express from "express";

// Import Axios for making HTTP requests to other services
import axios from "axios";

// Import middleware to verify JWT tokens
import { authenticateToken } from "../middlewares/auth.js";

// Import middleware to restrict access to specific roles
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

// Initialize Express router for admin routes
const router = express.Router();

/**
 * GET /api/organizer-applications
 * Fetches all pending organizer applications from the organizer service
 * Requires admin authentication and role authorization
 */
router.get(
  "/organizer-applications",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      // Make a GET request to the organizer service to retrieve applications
      const response = await axios.get(
        `${process.env.ORGANIZER_SERVICE_URL}/api/organizer/applications`,
        {
          headers: { Authorization: req.header("Authorization") },
        }
      );

      // Log response data for debugging
      console.log(response.data);

      // Send the applications data as JSON response
      res.json(response.data);
    } catch (err) {
      // Handle errors by returning a 500 status with error message
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  }
);

/**
 * POST /api/organizer-applications/:applicationId/approve
 * Approves an organizer application and updates user role
 * Requires admin authentication and role authorization
 */
router.post(
  "/organizer-applications/:applicationId/approve",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { applicationId } = req.params;

      // Approve the application in the organizer service
      const appResponse = await axios.post(
        `${process.env.ORGANIZER_SERVICE_URL}/api/organizer/applications/${applicationId}/approve`,
        {},
        { headers: { Authorization: req.header("Authorization") } }
      );

      // Extract application data from response
      const application = appResponse.data.application;

      // Update the user's role to "organizer" in the user service
      await axios.patch(
        `${process.env.USER_SERVICE_URL}/api/users/${application.userId}`,
        { role: "organizer" },
        { headers: { Authorization: req.header("Authorization") } }
      );

      // Send success response
      res.json({ message: "Application approved successfully." });
    } catch (err) {
      // Log error details for debugging
      console.error("Approve error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      // Return error status and message from the service or a fallback
      res.status(err.response?.status || 500).json({
        error: err.response?.data?.error || "Failed to approve application",
      });
    }
  }
);

/**
 * POST /api/organizer-applications/:applicationId/reject
 * Rejects an organizer application with a provided reason
 * Requires admin authentication and role authorization
 */
router.post(
  "/organizer-applications/:applicationId/reject",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    // Extract rejection reason from request body
    const { reason } = req.body;

    // Validate that a rejection reason is provided
    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required." });
    }

    try {
      const { applicationId } = req.params;

      // Reject the application in the organizer service with the provided reason
      await axios.post(
        `${process.env.ORGANIZER_SERVICE_URL}/api/organizer/applications/${applicationId}/reject`,
        { reason },
        { headers: { Authorization: req.header("Authorization") } }
      );

      // Send success response
      res.json({ message: "Application rejected successfully." });
    } catch (err) {
      // Log error details for debugging
      console.error("Reject error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      // Return error status and message from the service or a fallback
      res.status(err.response?.status || 500).json({
        error: err.response?.data?.error || "Failed to reject application",
      });
    }
  }
);

// Export the router for use in the main server file
export default router;
