// Import Express for creating the router
import express from "express";

// Import controller functions for organizer-related operations
import {
  apply,
  getApplicationStatus,
  getAllApplications,
  reviewApplication,
} from "../controllers/organizerController.js";

// Import middleware to verify JWT tokens
import { authenticateToken } from "../middlewares/auth.js";

// Import middleware to restrict access to specific roles
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

// Initialize Express router for organizer routes
const router = express.Router();

/**
 * POST /api/organizer/apply
 * Submits a new organizer application (requires authentication)
 */
router.post(
  "/organizer/apply",
  authenticateToken, // Verify JWT token
  apply // Handle application submission
);

/**
 * GET /api/organizer/application/status
 * Retrieves the status of the authenticated user's organizer application
 */
router.get(
  "/organizer/application/status",
  authenticateToken, // Verify JWT token
  getApplicationStatus // Handle fetching application status
);

/**
 * GET /api/organizer/applications
 * Retrieves all pending organizer applications (admin-only)
 */
router.get(
  "/organizer/applications",
  authenticateToken, // Verify JWT token
  authorizeRoles(["admin"]), // Restrict to admin role
  getAllApplications // Handle fetching all applications
);

/**
 * POST /api/organizer/applications/:id/approve
 * Approves an organizer application (admin-only)
 */
router.post(
  "/organizer/applications/:id/approve",
  authenticateToken, // Verify JWT token
  authorizeRoles(["admin"]), // Restrict to admin role
  async (req, res) => {
    try {
      // Extract application ID from request parameters
      const { id } = req.params;

      // Log approval action for debugging
      console.log("Approving application:", { id });

      // Review application with 'approved' status
      const updated = await reviewApplication(req, res, { status: "approved" });

      // Return success response with updated application
      res.status(200).json({
        message: "Application approved successfully",
        application: updated,
      });
    } catch (err) {
      // Log errors for debugging
      console.error("Approve application error:", err.message);

      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /api/organizer/applications/:id/reject
 * Rejects an organizer application with a reason (admin-only)
 */
router.post(
  "/organizer/applications/:id/reject",
  authenticateToken, // Verify JWT token
  authorizeRoles(["admin"]), // Restrict to admin role
  async (req, res) => {
    try {
      // Extract application ID and rejection reason from request
      const { id } = req.params;
      const { reason } = req.body;

      // Validate rejection reason
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      // Log rejection action for debugging
      console.log("Rejecting application:", { id, reason });

      // Review application with 'rejected' status and reason
      const updated = await reviewApplication(req, res, {
        status: "rejected",
        rejectionReason: reason,
      });

      // Return success response with updated application
      res.status(200).json({
        message: "Application rejected successfully",
        application: updated,
      });
    } catch (err) {
      // Log errors for debugging
      console.error("Reject application error:", err.message);

      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }
);

// Export the router for use in the main server file
export default router;
