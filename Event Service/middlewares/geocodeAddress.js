// Import the axios library, which is used to make HTTP requests to external APIs (like LocationIQ).
import axios from "axios";

// Define an async middleware function called geocodeAddress to process addresses in incoming requests.
// It takes three parameters:
// - req: The HTTP request object, containing data sent by the client (e.g., event details).
// - res: The HTTP response object, used to send responses back to the client (e.g., errors).
// - next: A function to pass control to the next middleware or route handler.
// The function is exported so it can be used in other files (e.g., routes/event.js).
export async function geocodeAddress(req, res, next) {
  // Start a try-catch block to handle potential errors (e.g., network issues, invalid data).
  // If an error occurs, the catch block will handle it gracefully.
  try {
    // Log the request body for debugging, showing what data the client sent (e.g., event name, address).
    // This helps developers troubleshoot issues by seeing the input data.
    console.log("Geocode middleware: Received body:", req.body); // Debug log

    // Extract the 'address' field from req.body.location (e.g., { location: { address: "123 Bandra Road, Mumbai" } }).
    // Use || {} to provide an empty object if req.body.location is undefined, preventing errors.
    const { address } = req.body.location || {};

    // Check if the address is missing, not a string, or empty after trimming spaces.
    // If any of these are true, it’s an invalid address.
    if (!address || typeof address !== "string" || address.trim() === "") {
      // Log that the address is invalid for debugging purposes.
      console.log("Geocode middleware: Invalid address");
      // Send a 400 (Bad Request) response with an error message telling the client to provide a valid address.
      // The return ensures the middleware stops here and doesn’t continue.
      return res
        .status(400)
        .json({ error: "Provide a valid address in location.address" });
    }

    // Get the LocationIQ API key from environment variables (securely stored outside the code).
    // This key is required to authenticate requests to the LocationIQ API.
    const apiKey = process.env.LOCATIONIQ_API_KEY;

    // Check if the API key is missing or undefined.
    if (!apiKey) {
      // Log that the API key is missing for debugging.
      console.log("Geocode middleware: Missing LocationIQ API key");
      // Send a 500 (Internal Server Error) response, indicating a server configuration issue.
      // The return ensures the middleware stops here.
      return res
        .status(500)
        .json({ error: "LocationIQ API key is missing from environment" });
    }

    // Build the URL for the LocationIQ API request to geocode the address.
    // The URL includes:
    // - The API endpoint: https://us1.locationiq.com/v1/search
    // - The API key: key=${apiKey}
    // - The address: q=${encodeURIComponent(address.trim())} (trimmed and URL-encoded to handle spaces/special characters)
    // - Format: format=json (response in JSON format)
    // - Limit: limit=1 (return only the best match)
    // - Normalize address: normalizeaddress=1 (standardize the address)
    // - Address details: addressdetails=1 (include city, state, etc.)
    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
      address.trim()
    )}&format=json&limit=1&normalizeaddress=1&addressdetails=1`;

    // Log the URL being sent to LocationIQ for debugging, helping track the exact API call.
    console.log("Geocode middleware: Sending request to:", url);

    // Use axios to send an HTTP GET request to the LocationIQ API and wait for the response.
    // The await keyword pauses execution until the API responds.
    const response = await axios.get(url);

    // Store the API response data (an array of results) in the results variable.
    const results = response.data;

    // Log the API response for debugging, showing what LocationIQ returned.
    console.log("Geocode middleware: LocationIQ response:", results);

    // Check if the API returned no results or an empty array, meaning the address couldn’t be geocoded.
    if (!results || results.length === 0) {
      // Log that no results were found for the given address.
      console.log(`Geocode middleware: No results for address: "${address}"`);
      // Send a 400 (Bad Request) response, asking the client to check the address.
      return res.status(400).json({
        error:
          "Unable to geocode the provided address. Please check the address and try again.",
      });
    }

    // Extract three fields from the first result (results[0]):
    // - display_name: The full, human-readable address (e.g., "123 Bandra Road, Mumbai, Maharashtra, India").
    // - place_id: A unique identifier for the location from LocationIQ.
    // - address: An object with detailed address components (e.g., city, state, suburb).
    const { display_name, place_id, address: addressDetails } = results[0];

    // Initialize an empty city variable to store the extracted city name.
    let city = "";

    // Define a list of Indian states to avoid mistaking a state (e.g., "Maharashtra") for a city.
    const indianStates = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
    ];

    // Define a list of administrative suffixes (e.g., "District") that might appear in location names.
    // These help clean up names like "Pune District" to extract just "Pune".
    const adminSuffixes = [
      "Tahsil",
      "Tehsil",
      "District",
      "Taluk",
      "Taluka",
      "Mandal",
    ];

    // Split the display_name (e.g., "123 Bandra Road, Mumbai, Maharashtra, India") into an array of parts.
    // Trim each part to remove extra spaces (e.g., ["123 Bandra Road", "Mumbai", "Maharashtra", "India"]).
    const displayParts = display_name.split(",").map((part) => part.trim());

    // Define a helper function to check if a term is likely a suburb (a smaller area within a city).
    // Parameters:
    // - term: The name to check (e.g., "Bandra").
    // - addressDetails: The API’s address object.
    // - displayParts: The array of address parts.
    // Returns true if the term is a suburb, false otherwise.
    const isSuburbLike = (term, addressDetails, displayParts) => {
      // If the term is empty or undefined, it’s not a suburb.
      if (!term) return false;

      // Convert the term to lowercase for case-insensitive comparison.
      const termLower = term.toLowerCase();

      // If the term matches the suburb field in addressDetails, it’s a suburb.
      if (
        addressDetails.suburb &&
        termLower === addressDetails.suburb.toLowerCase()
      ) {
        return true;
      }

      // Find the index of the term in displayParts (e.g., where "Bandra" appears).
      const termIndex = displayParts.findIndex(
        (p) => p.toLowerCase() === termLower
      );

      // If the term appears early in the address (before the last three parts, like state or country),
      // it’s likely a suburb (e.g., "Bandra" in "Bandra, Mumbai, Maharashtra, India").
      return termIndex >= 0 && termIndex < displayParts.length - 3;
    };

    // Step 1: Try to use the city field from addressDetails.
    if (addressDetails.city) {
      // Convert the city to lowercase for case-insensitive checks.
      const cityLower = addressDetails.city.toLowerCase();

      // Check if the city is valid by ensuring:
      // - It’s not an Indian state (e.g., not "Maharashtra").
      // - It’s not a suburb (using isSuburbLike).
      // - It doesn’t contain administrative suffixes (e.g., "District").
      if (
        !indianStates.includes(addressDetails.city) &&
        !isSuburbLike(addressDetails.city, addressDetails, displayParts) &&
        !adminSuffixes.some((s) => cityLower.includes(s.toLowerCase()))
      ) {
        // Find the index of the city in displayParts to ensure it’s not in the state/country position.
        const cityIndex = displayParts.findIndex(
          (p) => p.toLowerCase() === cityLower
        );

        // If the city appears before the last two parts (e.g., not state or country), use it.
        if (cityIndex >= 0 && cityIndex < displayParts.length - 2) {
          city = addressDetails.city;
          // Log that the city was found from the city field for debugging.
          console.log(`Geocode middleware: Using address.city: "${city}"`);
        }
      }
    }

    // Step 2: If no city was found, try the county field.
    if (!city && addressDetails.county) {
      // Trim the county name to remove extra spaces.
      const countyClean = addressDetails.county.trim();

      // Split the county into words (e.g., "Pune District" -> ["Pune", "District"]).
      const countyParts = countyClean.split(/\s+/);

      // If the county has multiple words and ends with an admin suffix (e.g., "District"),
      // extract the city part (e.g., "Pune" from "Pune District").
      let countyCity =
        countyParts.length > 1 &&
        adminSuffixes.some(
          (s) =>
            countyParts[countyParts.length - 1].toLowerCase() ===
            s.toLowerCase()
        )
          ? countyParts.slice(0, -1).join(" ")
          : countyClean;

      // Check if the cleaned county name is valid (not a state, suburb, or admin term).
      if (
        !indianStates.includes(countyCity) &&
        !isSuburbLike(countyCity, addressDetails, displayParts) &&
        !adminSuffixes.some((s) =>
          countyCity.toLowerCase().includes(s.toLowerCase())
        )
      ) {
        // Find the index of the county city in displayParts.
        const countyCityIndex = displayParts.findIndex(
          (p) => p.toLowerCase() === countyCity.toLowerCase()
        );

        // If it appears before the last two parts, use it as the city.
        if (countyCityIndex >= 0 && countyCityIndex < displayParts.length - 2) {
          city = countyCity;
          // Log that the city was found from the county field.
          console.log(`Geocode middleware: Using county: "${city}"`);
        }
      }
    }

    // Step 3: If no city was found, try other fields (city_district, town, or village).
    if (!city) {
      // Pick the first available field: city_district, town, village, or empty string.
      city =
        addressDetails.city_district ||
        addressDetails.town ||
        addressDetails.village ||
        "";

      // If a city was found, validate it.
      if (city) {
        // Convert to lowercase for checks.
        const cityLower = city.toLowerCase();

        // If the city is a state, suburb, or contains an admin suffix, discard it.
        if (
          indianStates.includes(city) ||
          isSuburbLike(city, addressDetails, displayParts) ||
          adminSuffixes.some((s) => cityLower.includes(s.toLowerCase()))
        ) {
          city = "";
        } else {
          // Log that the city was found from a fallback field.
          console.log(`Geocode middleware: Using fallback: "${city}"`);
        }
      }
    }

    // Step 4: If no city was found, parse the display_name as a last resort.
    if (!city) {
      // Loop through displayParts backward, starting from the second-to-last part (to skip country).
      for (let i = displayParts.length - 2; i >= 0; i--) {
        // Get the current part (e.g., "Mumbai" or "Maharashtra").
        const part = displayParts[i];

        // Convert to lowercase for checks.
        const partLower = part.toLowerCase();

        // Check if the part contains an admin suffix (e.g., "Pune District").
        const isAdminTerm = adminSuffixes.some((suffix) =>
          partLower.includes(suffix.toLowerCase())
        );

        // If it’s an admin term, try to extract the city part.
        if (isAdminTerm) {
          // Split the part into words (e.g., "Pune District" -> ["Pune", "District"]).
          const subParts = part.split(/\s+/);

          // If the part has multiple words and ends with an admin suffix, extract the city.
          if (
            subParts.length > 1 &&
            adminSuffixes.some(
              (s) =>
                subParts[subParts.length - 1].toLowerCase() === s.toLowerCase()
            )
          ) {
            // Get the city by removing the last word (e.g., "Pune" from "Pune District").
            let candidateCity = subParts.slice(0, -1).join(" ");

            // Validate the candidate city (not a state, suburb, or admin term).
            if (
              !indianStates.includes(candidateCity) &&
              !isSuburbLike(candidateCity, addressDetails, displayParts) &&
              !adminSuffixes.some((s) =>
                candidateCity.toLowerCase().includes(s.toLowerCase())
              )
            ) {
              city = candidateCity;
              // Log that the city was found by parsing an admin term.
              console.log(
                `Geocode middleware: Admin term parsing: "${part}" -> "${city}"`
              );
              // Stop the loop once a city is found.
              break;
            }
          }
        }

        // If the part is not a state, country, suburb, or admin term, use it as the city.
        if (
          !indianStates.includes(part) &&
          part !== "India" &&
          !isSuburbLike(part, addressDetails, displayParts) &&
          !adminSuffixes.some((s) => partLower.includes(s.toLowerCase()))
        ) {
          city = part;
          // Log that the city was found by parsing display_name.
          console.log(
            `Geocode middleware: Display name parsing: "${part}" -> "${city}"`
          );
          // Stop the loop once a city is found.
          break;
        }
      }
    }

    // If no city was found after all steps, send an error.
    if (!city) {
      // Log that the city couldn’t be determined.
      console.log("Geocode middleware: Could not determine city");
      // Send a 400 (Bad Request) response, asking for a clearer address.
      return res.status(400).json({
        error:
          "Could not determine city from the provided address. Please include a clear city name.",
      });
    }

    // Store the geocoded data in req.geocodedLocation for use by later middleware or route handlers.
    // Includes:
    // - city: The extracted city name (e.g., "Mumbai").
    // - address: The full display_name (e.g., "123 Bandra Road, Mumbai, Maharashtra, India").
    // - placeId: The LocationIQ place ID (or empty string if missing).
    req.geocodedLocation = {
      city,
      address: display_name,
      placeId: place_id || "",
    };

    // Log the successful geocoding result for debugging.
    console.log(
      `Geocode middleware: Success - City: "${city}", Address: "${display_name}"`
    );

    // Call next() to pass control to the next middleware or route handler.
    next();
    // Catch any errors that occur during the middleware’s execution.
  } catch (err) {
    // Log the error details (message and stack trace) for debugging.
    console.error("Geocode middleware: Error:", err.message, err.stack);

    // Check if the error came from the API response (e.g., network or API issues).
    if (err.response) {
      // Log the API response status and data for debugging.
      console.error(
        "Geocode middleware: API Response:",
        err.response.status,
        err.response.data
      );

      // Handle specific API error codes:
      // - 400 or 404: Invalid or unresolvable address.
      if ([400, 404].includes(err.response.status)) {
        return res.status(400).json({
          error:
            "Unable to geocode the provided address. Please check the address and try again.",
        });
      }

      // - 429: Too many requests (rate limit exceeded).
      if (err.response.status === 429) {
        return res
          .status(429)
          .json({ error: "Rate limit exceeded. Please try again later." });
      }

      // - 401 or 403: Invalid or unauthorized API key.
      if (err.response.status === 401 || err.response.status === 403) {
        return res.status(500).json({
          error: "Invalid LocationIQ API key. Contact the administrator.",
        });
      }
    }

    // For any other errors (e.g., network issues), send a generic 500 (Internal Server Error) response.
    return res.status(500).json({
      error: "Failed to geocode address: " + err.message,
    });
  }
}
