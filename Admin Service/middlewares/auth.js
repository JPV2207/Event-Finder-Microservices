// Import JSON Web Token library for token verification
import jwt from "jsonwebtoken";

// Import Axios for making HTTP requests to the user service
import axios from "axios";

/**
 * Middleware to authenticate requests using a JWT token
 * Verifies the token, fetches user profile, and attaches user info to the request
 */
export async function authenticateToken(req, res, next) {
  // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    // Verify the JWT using the secret key from environment variables
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user profile from the user service using the token
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/api/users/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Extract user data from the response
    const user = response.data;

    // Check if user data is returned
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user info (ID and role) to the request object for use in subsequent middleware/routes
    req.user = {
      userId: user._id, // Assumes user service returns _id in the profile response
      role: user.role, // Assumes role is included in the profile response
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Log token verification errors for debugging
    console.error("Token verification error:", err.message);

    // Return 400 status for invalid or expired tokens
    res.status(400).json({ error: "Invalid token" });
  }
}
