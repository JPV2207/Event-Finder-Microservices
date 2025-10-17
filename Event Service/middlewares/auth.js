// Import JSON Web Token library for token verification
import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using a JWT token
 * Verifies the token and attaches user data to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function authenticateToken(req, res, next) {
  // Extract the Authorization header
  const authHeader = req.headers["authorization"];

  // Extract the token from the header (format: "Bearer <token>")
  const token = authHeader && authHeader.split(" ")[1];

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Verify the JWT using the secret key from environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Return 403 status for invalid or expired tokens
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Attach decoded user data (from token payload) to the request
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
}
