// Import Express for creating the router
import express from "express";

// Import EventController for handling event-related requests
import { EventController } from "../controllers/eventController.js";

// Import middleware to verify JWT tokens
import { authenticateToken } from "../middlewares/auth.js";

// Import middleware to restrict access to specific roles
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

// Import middleware to geocode addresses (adds req.geocodedLocation)
// import { validateLatLng } from "../middlewares/validateCoords.js"; // Disabled middleware for coordinate validation
import { geocodeAddress } from "../middlewares/geocodeAddress.js";

// Initialize Express router for event routes
const router = express.Router();

// Create an instance of EventController
const eventController = new EventController();

/**
 * POST /api/events
 * Creates a new event (requires organizer role and geocoded address)
 */
router.post(
  "/",
  authenticateToken, // Verify JWT token
  authorizeRoles(["organizer"]), // Restrict to organizer role
  geocodeAddress, // Add geocoded location data to request
  eventController.createEvent.bind(eventController) // Handle event creation
);

/**
 * POST /api/events/:id/like
 * Likes an event for the authenticated user
 */
router.post(
  "/:id/like",
  authenticateToken, // Verify JWT token
  eventController.likeEvent.bind(eventController) // Handle liking the event
);

/**
 * DELETE /api/events/:id/unlike
 * Unlikes an event for the authenticated user
 */
router.delete(
  "/:id/unlike",
  authenticateToken, // Verify JWT token
  eventController.unlikeEvent.bind(eventController) // Handle unliking the event
);

/**
 * POST /api/events/:id/comment
 * Adds a comment to an event
 */
router.post(
  "/:id/comment",
  authenticateToken, // Verify JWT token
  eventController.commentOnEvent.bind(eventController) // Handle adding comment
);

/**
 * PUT /api/events/:id/comments/:commentId
 * Updates a comment on an event
 */
router.put(
  "/:id/comments/:commentId",
  authenticateToken, // Verify JWT token
  eventController.updateComment.bind(eventController) // Handle updating comment
);

/**
 * DELETE /api/events/:id/comment/:commentId
 * Deletes a comment from an event
 */
router.delete(
  "/:id/comment/:commentId",
  authenticateToken, // Verify JWT token
  eventController.deleteComment.bind(eventController) // Handle deleting comment
);

/**
 * GET /api/events
 * Retrieves events based on query parameters
 */
router.get(
  "/",
  eventController.getEvents.bind(eventController) // Handle fetching events
);

/**
 * GET /api/events/nearby
 * Retrieves events near a specified city
 */
router.get(
  "/nearby",
  eventController.getNearbyEvents.bind(eventController) // Handle fetching nearby events
);

/**
 * GET /api/events/:id
 * Retrieves a single event by ID
 */
router.get(
  "/:id",
  eventController.getEventById.bind(eventController) // Handle fetching event by ID
);

/**
 * PUT /api/events/:id
 * Updates an existing event (requires organizer role and geocoded address)
 */
router.put(
  "/:id",
  authenticateToken, // Verify JWT token
  authorizeRoles(["organizer"]), // Restrict to organizer role
  geocodeAddress, // Add geocoded location data to request
  eventController.updateEvent.bind(eventController) // Handle updating event
);

/**
 * DELETE /api/events/:id
 * Deletes an event (requires organizer role)
 */
router.delete(
  "/:id",
  authenticateToken, // Verify JWT token
  authorizeRoles(["organizer"]), // Restrict to organizer role
  eventController.deleteEvent.bind(eventController) // Handle deleting event
);

// Export the router for use in the main server file
export default router;
