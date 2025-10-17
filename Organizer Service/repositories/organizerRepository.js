// Import OrganizerApplication model for MongoDB operations
import OrganizerApplication from "../models/organizerApplication.js";

/**
 * Creates a new organizer application in the database
 * @param {Object} data - Application data (e.g., userId, fullName, organizationName)
 * @returns {Promise<Object>} The created application document
 */
export const createApplication = async (data) => {
  // Create a new OrganizerApplication instance with provided data
  const app = new OrganizerApplication(data);

  // Save the application to the database
  return await app.save();
};

/**
 * Finds an organizer application by user ID
 * @param {string} userId - ID of the user associated with the application
 * @returns {Promise<Object|null>} The application document or null if not found
 */
export const findApplicationByUserId = async (userId) => {
  // Query for an application with the specified userId
  return await OrganizerApplication.findOne({ userId });
};

/**
 * Retrieves all pending organizer applications
 * @returns {Promise<Array>} List of pending application documents
 */
export const getAllApplications = async () => {
  // Fetch all applications with 'pending' status
  return await OrganizerApplication.find({ status: "pending" });
};

/**
 * Updates the status of an organizer application
 * @param {string} id - ID of the application to update
 * @param {string} status - New status ('approved' or 'rejected')
 * @param {string|null} [rejectionReason=null] - Reason for rejection (if status is 'rejected')
 * @returns {Promise<Object>} The updated application document
 * @throws {Error} If status is invalid or application is not found
 */
export const updateApplicationStatus = async (
  id,
  status,
  rejectionReason = null
) => {
  // Validate status
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status. Must be 'approved' or 'rejected'");
  }

  // Update application with new status, rejection reason (if rejected), and reviewedAt timestamp
  const updated = await OrganizerApplication.findByIdAndUpdate(
    id,
    {
      status,
      rejectionReason: status === "rejected" ? rejectionReason : null, // Set rejection reason only if rejected
      reviewedAt: new Date(), // Record the review timestamp
    },
    { new: true } // Return the updated document
  );

  // Check if application was found
  if (!updated) {
    throw new Error("Application not found");
  }

  // Return the updated application
  return updated;
};
