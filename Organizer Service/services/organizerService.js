// Import organizer repository functions for database operations
import * as organizerRepository from "../repositories/organizerRepository.js";

/**
 * Submits a new organizer application
 * @param {Object} data - Application data (userId, fullName, organizationName, contactNumber, description)
 * @returns {Promise<Object>} The created application document
 * @throws {Error} If the user has already applied
 */
export const applyForOrganizer = async (data) => {
  // Check if an application already exists for the user
  const existing = await organizerRepository.findApplicationByUserId(data.userId);
  if (existing) throw new Error("You have already applied.");

  // Create and save the new application
  return await organizerRepository.createApplication(data);
};

/**
 * Retrieves the status of a user's organizer application
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Application document or 'not applied' status
 */
export const getApplicationStatus = async (userId) => {
  // Fetch application by user ID
  const application = await organizerRepository.findApplicationByUserId(userId);

  // Return 'not applied' status if no application exists
  if (!application)
    return {
      status: "not applied",
      message: "You have not applied to become an organizer.",
    };

  // Return the full application document
  return application;
};

/**
 * Retrieves all pending organizer applications
 * @returns {Promise<Array>} List of pending application documents
 */
export const getApplications = async () => {
  // Fetch all pending applications from the repository
  return await organizerRepository.getAllApplications();
};

/**
 * Reviews an organizer application (approve or reject)
 * @param {string} id - ID of the application to review
 * @param {string} status - New status ('approved' or 'rejected')
 * @param {string|null} [rejectionReason=null] - Reason for rejection (if applicable)
 * @returns {Promise<Object>} The updated application document
 * @throws {Error} If rejection reason is missing for rejected status
 */
export const reviewApplication = async (id, status, rejectionReason = null) => {
  // Validate rejection reason for rejected status
  if (status === "rejected" && !rejectionReason) {
    throw new Error("Rejection reason is required when rejecting.");
  }

  // Update application status and optionally set rejection reason
  return await organizerRepository.updateApplicationStatus(
    id,
    status,
    rejectionReason
  );
};
