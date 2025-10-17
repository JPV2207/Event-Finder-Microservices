// Import organizer service for handling organizer-related business logic
import * as organizerService from "../services/organizerService.js";

/**
 * Handles organizer application submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const apply = async (req, res) => {
  try {
    // Extract application data from request body
    const { fullName, organizationName, contactNumber, description } = req.body;

    // Submit application using organizerService, including userId from JWT
    const application = await organizerService.applyForOrganizer({
      userId: req.user.userId, // Assumes req.user is set by authenticateToken middleware
      fullName,
      organizationName,
      contactNumber,
      description,
    });

    // Return success response with confirmation message
    res.status(201).json({
      message:
        "Thank you for your application to become an organizer. Our team will carefully review your submission within 1-2 business days.",
    });
  } catch (err) {
    // Handle errors with a 400 status and error message
    res.status(400).json({ error: err.message });
  }
};

/**
 * Retrieves the status of a user's organizer application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getApplicationStatus = async (req, res) => {
  try {
    // Fetch application status for the authenticated user
    const application = await organizerService.getApplicationStatus(
      req.user.userId // Assumes req.user is set by authenticateToken middleware
    );

    // Handle case where no application exists
    if (application.status === "not applied") {
      return res.status(200).json({
        status: application.status,
        message: application.message,
      });
    }

    // Customize response message based on application status
    let message;
    if (application.status === "approved") {
      message =
        "Congratulations! Your application to become an organizer has been approved. You now have access to event creation and management features.";
    } else if (application.status === "rejected") {
      message = `${
        application.rejectionReason || "No reason provided."
      } You can apply again after making necessary improvements.`;
    } else if (application.status === "pending") {
      message =
        "Your application is pending review. We will notify you in 1-2 business days.";
    }

    // Return status and message
    res.status(200).json({ status: application.status, message });
  } catch (err) {
    // Log errors for debugging
    console.error("Get application status error:", err.message);

    // Handle errors with a 500 status
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves all organizer applications (admin access)
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 */
export const getAllApplications = async (_req, res) => {
  try {
    // Fetch all organizer applications using organizerService
    const applications = await organizerService.getApplications();

    // Return applications list
    res.status(200).json(applications);
  } catch (err) {
    // Log errors for debugging
    console.error("Get all applications error:", err.message);

    // Handle errors with a 500 status
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

/**
 * Reviews an organizer application (approve/reject)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} params - Parameters including status and optional rejectionReason
 */
export const reviewApplication = async (
  req,
  res,
  { status, rejectionReason = null }
) => {
  try {
    // Extract application ID from request parameters
    const { id } = req.params;

    // Log review details for debugging
    console.log("Reviewing application:", { id, status, rejectionReason });

    // Review application using organizerService
    const updated = await organizerService.reviewApplication(
      id,
      status,
      rejectionReason
    );

    // Return updated application (handled by route)
    return updated;
  } catch (err) {
    // Throw error to be handled by the route handler
    throw err;
  }
};
