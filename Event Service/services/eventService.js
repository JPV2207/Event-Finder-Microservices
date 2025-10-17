// Import EventRepository for database operations
import { EventRepository } from "../repository/eventRepository.js";

// Service class for handling business logic related to events
export class EventService {
  constructor() {
    // Initialize EventRepository instance for database interactions
    this.eventRepository = new EventRepository();
  }

  /**
   * Creates a new event with provided data and user ID
   * @param {Object} eventData - Data for the new event
   * @param {string} userId - ID of the user creating the event
   * @returns {Promise<Object>} The created event document
   */
  async createEvent(eventData, userId) {
    // Combine event data with user ID
    const locDoc = {
      ...eventData,
      userId,
    };
    // Create event in the database using EventRepository
    return await this.eventRepository.create(locDoc);
  }

  /**
   * Likes an event for the specified user
   * @param {string} eventId - ID of the event to like
   * @param {string} userId - ID of the user liking the event
   * @returns {Promise<Object>} Response with success message and likes count
   */
  async likeEvent(eventId, userId) {
    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user already liked the event
    if (event.likes.includes(userId))
      throw new Error("You already liked this event");

    // Add user ID to likes array
    event.likes.push(userId);
    await event.save();

    // Return success message and updated likes count
    return { message: "Event liked", likesCount: event.likes.length };
  }

  /**
   * Unlikes an event for the specified user
   * @param {string} eventId - ID of the event to unlike
   * @param {string} userId - ID of the user unliking the event
   * @returns {Promise<Object>} Response with success message and likes count
   */
  async unlikeEvent(eventId, userId) {
    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user has liked the event
    if (!event.likes.includes(userId))
      throw new Error("You have not liked this event");

    // Remove user ID from likes array
    event.likes = event.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    await event.save();

    // Return success message and updated likes count
    return { message: "Event unliked", likesCount: event.likes.length };
  }

  /**
   * Adds a comment to an event
   * @param {string} eventId - ID of the event
   * @param {string} userId - ID of the user commenting
   * @param {string} text - Comment text
   * @returns {Promise<Object>} Response with success message and updated comments
   */
  async commentOnEvent(eventId, userId, text) {
    // Validate comment text
    if (!text || text.trim() === "")
      throw new Error("Comment text is required");

    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Add new comment to event's comments array
    event.comments.push({ userId, text });
    await event.save();

    // Return success message and updated comments
    return { message: "Comment added", comments: event.comments };
  }

  /**
   * Updates a comment on an event
   * @param {string} eventId - ID of the event
   * @param {string} commentId - ID of the comment to update
   * @param {string} userId - ID of the user updating the comment
   * @param {string} text - Updated comment text
   * @returns {Promise<Object>} The updated comment
   */
  async updateComment(eventId, commentId, userId, text) {
    // Validate comment text
    if (!text || text.trim() === "")
      throw new Error("Comment text cannot be empty");

    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Find comment by ID within event's comments array
    const comment = event.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) throw new Error("Access denied");

    // Update comment text and timestamp
    comment.text = text;
    comment.updatedAt = new Date();
    await event.save();

    // Return the updated comment
    return comment;
  }

  /**
   * Deletes a comment from an event
   * @param {string} eventId - ID of the event
   * @param {string} commentId - ID of the comment to delete
   * @param {string} userId - ID of the user deleting the comment
   * @returns {Promise<Object>} Response with success message and updated comments
   */
  async deleteComment(eventId, commentId, userId) {
    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Find comment by ID within event's comments array
    const comment = event.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if user owns the comment
    if (comment.userId.toString() !== userId)
      throw new Error("You can only delete your own comments");

    // Remove the comment from the array
    comment.deleteOne();
    await event.save();

    // Return success message and updated comments
    return { message: "Comment deleted", comments: event.comments };
  }

  /**
   * Retrieves events based on query filters and sorting
   * @param {Object} options - Query parameters (category, futureOnly, timeRange, year, priceMin, priceMax, city, sortBy)
   * @returns {Promise<Array>} List of event documents
   */
  async getEvents({
    category,
    futureOnly,
    timeRange,
    year,
    priceMin,
    priceMax,
    city,
    sortBy,
  }) {
    // Initialize filter object
    const filter = {};

    // Apply category filter if provided
    if (category) filter.category = category;

    // Filter for future events if specified
    if (futureOnly === "true") filter.date = { $gte: new Date() };

    // Filter by city (case-insensitive)
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, "i") };

    // Filter by year if provided
    if (year) {
      const y = parseInt(year);
      if (isNaN(y) || y < 1970 || y > 3000)
        throw new Error("Invalid year value");
      const yearStart = new Date(`${y}-01-01T00:00:00Z`);
      const yearEnd = new Date(`${y}-12-31T23:59:59Z`);
      filter.date = { $gte: yearStart, $lte: yearEnd };
    } else if (timeRange) {
      // Filter by time range (last24h, lastWeek, lastMonth, lastYear)
      const now = new Date();
      switch (timeRange.toLowerCase()) {
        case "last24h":
          filter.date = {
            ...filter.date,
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          };
          break;
        case "lastWeek":
          filter.date = {
            ...filter.date,
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          };
          break;
        case "lastMonth":
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          filter.date = { ...filter.date, $gte: lastMonth };
          break;
        case "lastYear":
          const ly = now.getFullYear() - 1;
          const lyStart = new Date(`${ly}-01-01T00:00:00Z`);
          const lyEnd = new Date(`${ly}-12-31T23:59:59Z`);
          filter.date = { ...filter.date, $gte: lyStart, $lte: lyEnd };
          break;
        default:
          throw new Error("Invalid timeRange value");
      }
    }

    // Filter by price range if provided
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    // Set sorting options (default to date ascending)
    let sort = null;
    if (sortBy) {
      switch (sortBy) {
        case "dateAsc":
          sort = { date: 1 };
          break;
        case "dateDesc":
          sort = { date: -1 };
          break;
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        default:
          throw new Error("Invalid sortBy value");
      }
    } else {
      sort = { date: 1 };
    }

    // Fetch events using EventRepository with filters and sorting
    return await this.eventRepository.findAll(filter, sort);
  }

  /**
   * Retrieves events in a specified city
   * @param {string} city - City name to filter events
   * @param {number} [limit=20] - Maximum number of events to return
   * @returns {Promise<Array>} List of event documents
   */
  async getNearbyEvents(city, limit = 20) {
    // Validate city parameter
    if (!city || typeof city !== "string" || city.trim() === "") {
      throw new Error("Valid city name is required");
    }

    // Filter events by city (case-insensitive)
    const filter = { city: { $regex: new RegExp(`^${city}$`, "i") } };

    // Fetch events using EventRepository with city filter and limit
    return await this.eventRepository.findAll(
      filter,
      { date: 1 }, // Sort by date ascending
      Math.min(parseInt(limit, 10), 100) // Cap limit at 100
    );
  }

  /**
   * Updates an event if the user is authorized
   * @param {string} eventId - ID of the event to update
   * @param {string} userId - ID of the user updating the event
   * @param {Object} updateData - Data to update the event
   * @returns {Promise<Object>} The updated event document
   */
  async updateEvent(eventId, userId, updateData) {
    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user is the event creator
    if (event.userId.toString() !== userId) throw new Error("Access denied");

    // Update event using EventRepository
    return await this.eventRepository.update(eventId, updateData);
  }

  /**
   * Deletes an event if the user is authorized
   * @param {string} eventId - ID of the event to delete
   * @param {string} userId - ID of the user deleting the event
   * @returns {Promise<Object>} Success response
   */
  async deleteEvent(eventId, userId) {
    // Fetch event by ID
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user is the event creator
    if (event.userId.toString() !== userId) throw new Error("Access denied");

    // Delete event using EventRepository
    await this.eventRepository.delete(eventId);

    // Return success response
    return { ok: true };
  }
}
