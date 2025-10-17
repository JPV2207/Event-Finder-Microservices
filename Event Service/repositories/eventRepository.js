// Import the Event model for MongoDB operations
import Event from "../models/event.js";

// Repository class for handling database operations related to events
export class EventRepository {
  /**
   * Creates a new event in the database
   * @param {Object} eventData - Data for the new event
   * @returns {Promise<Object>} The created event document
   */
  async create(eventData) {
    // Create and save a new event using the Event model
    return await Event.create(eventData);
  }

  /**
   * Finds an event by its ID
   * @param {string} id - The ID of the event
   * @returns {Promise<Object|null>} The event document or null if not found
   */
  async findById(id) {
    // Retrieve an event by its MongoDB ObjectId
    return await Event.findById(id);
  }

  /**
   * Finds events based on filters and sorting options
   * @param {Object} filters - Query filters for events (e.g., { city: "New York" })
   * @param {Object} sort - Sorting options (e.g., { date: 1 })
   * @returns {Promise<Array>} List of event documents (up to 100)
   */
  async findAll(filters, sort) {
    // Build query to find events with provided filters, limited to 100 results
    let query = Event.find(filters).limit(100);

    // Apply sorting if provided
    if (sort) {
      query = query.sort(sort);
    }

    // Execute the query and return results
    return await query.exec();
  }

  /**
   * Finds events near a specified location (currently disabled)
   * @param {number} lng - Longitude of the center point
   * @param {number} lat - Latitude of the center point
   * @param {number} maxDistance - Maximum distance in meters
   * @param {number} limit - Maximum number of events to return
   * @returns {Promise<Array>} List of nearby event documents
   */
  // async findNearby(lng, lat, maxDistance, limit) {
  //   return await Event.find({
  //     location: {
  //       $near: {
  //         $geometry: { type: "Point", coordinates: [lng, lat] },
  //         $maxDistance: maxDistance,
  //       },
  //     },
  //   })
  //     .sort({ date: 1 }) // Sort by date in ascending order
  //     .limit(limit); // Limit the number of results
  // }

  /**
   * Updates an event by its ID
   * @param {string} id - The ID of the event to update
   * @param {Object} updateData - Data to update the event
   * @returns {Promise<Object|null>} The updated event document or null if not found
   */
  async update(id, updateData) {
    // Update event by ID and return the updated document
    return await Event.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Deletes an event by its ID
   * @param {string} id - The ID of the event to delete
   * @returns {Promise<Object|null>} The deleted event document or null if not found
   */
  async delete(id) {
    // Delete event by ID
    return await Event.findByIdAndDelete(id);
  }
}
