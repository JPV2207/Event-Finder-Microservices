// Import EventService for business logic related to events
import { EventService } from "../services/eventService.js";

// Controller class for handling event-related HTTP requests
export class EventController {
  constructor() {
    // Initialize EventService instance for use in controller methods
    this.eventService = new EventService();
  }

  /**
   * Creates a new event with provided data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createEvent(req, res) {
    try {
      // Extract event data from request body
      const { name, description, category, date, price } = req.body;

      // Validate required fields: name and date
      if (!name || !date) {
        return res.status(400).json({ error: "name and date are required" });
      }

      // Validate geocoded location with city
      if (!req.geocodedLocation) {
        return res
          .status(400)
          .json({ error: "Geocoded location with city is required" });
      }

      // Construct event data object with defaults for optional fields
      const eventData = {
        name,
        description: description || "",
        category: category || "other",
        date,
        price,
        city: req.geocodedLocation.city,
        location: {
          address: req.geocodedLocation.address,
          placeId: req.geocodedLocation.placeId,
        },
      };

      // Create event using EventService
      const event = await this.eventService.createEvent(
        eventData,
        req.user.userId
      );

      // Return created event with 201 status
      res.status(201).json(event);
    } catch (err) {
      // Handle errors with a 400 status and error message
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Likes an event for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async likeEvent(req, res) {
    try {
      // Call EventService to like the event
      const result = await this.eventService.likeEvent(
        req.params.id,
        req.user.userId
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Unlikes an event for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async unlikeEvent(req, res) {
    try {
      // Call EventService to unlike the event
      const result = await this.eventService.unlikeEvent(
        req.params.id,
        req.user.userId
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Adds a comment to an event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async commentOnEvent(req, res) {
    try {
      // Extract comment text from request body
      const { text } = req.body;

      // Call EventService to add comment
      const result = await this.eventService.commentOnEvent(
        req.params.id,
        req.user.userId,
        text
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Updates a comment on an event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateComment(req, res) {
    try {
      // Call EventService to update comment
      const result = await this.eventService.updateComment(
        req.params.id,
        req.params.commentId,
        req.user.userId,
        req.body.text
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Deletes a comment from an event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteComment(req, res) {
    try {
      // Call EventService to delete comment
      const result = await this.eventService.deleteComment(
        req.params.id,
        req.params.commentId,
        req.user.userId
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves events based on query parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEvents(req, res) {
    try {
      // Fetch events using EventService with query parameters
      const events = await this.eventService.getEvents(req.query);
      res.json(events);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves events near a specified city
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNearbyEvents(req, res) {
    try {
      // Extract city and limit from query parameters
      const { city, limit } = req.query;

      // Validate city parameter
      if (!city) {
        return res
          .status(400)
          .json({ error: "City query parameter is required" });
      }

      // Fetch nearby events using EventService
      const events = await this.eventService.getNearbyEvents(city, limit);
      res.json(events);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves a single event by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEventById(req, res) {
    try {
      // Fetch event by ID using EventService
      const event = await this.eventService.eventRepository.findById(
        req.params.id
      );

      // Check if event exists
      if (!event) return res.status(404).json({ error: "Event not found" });

      res.json(event);
    } catch (err) {
      // Handle invalid ID errors with a 400 status
      res.status(400).json({ error: "Invalid id" });
    }
  }

  /**
   * Updates an existing event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateEvent(req, res) {
    try {
      // Extract update fields from request body
      const { name, description, category, date, price } = req.body;

      // Build update data object with provided fields
      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (date) updateData.date = date;
      if (price !== undefined) updateData.price = price;
      if (req.geocodedLocation) {
        updateData.city = req.geocodedLocation.city;
        updateData.location = {
          address: req.geocodedLocation.address,
          placeId: req.geocodedLocation.placeId,
        };
      }

      // Update event using EventService
      const event = await this.eventService.updateEvent(
        req.params.id,
        req.user.userId,
        updateData
      );
      res.json(event);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Deletes an event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteEvent(req, res) {
    try {
      // Delete event using EventService
      const result = await this.eventService.deleteEvent(
        req.params.id,
        req.user.userId
      );
      res.json(result);
    } catch (err) {
      // Handle errors with a 400 status
      res.status(400).json({ error: err.message });
    }
  }
}
