// Import JSON Web Token library for token verification
import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using a JWT token
 * Verifies the token and attaches user data from the token payload to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default function auth(req, res, next) {
  // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.headers.authorization?.split(" ")[1];

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Verify the JWT using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data (userId and role) from token payload to the request
    // Assumes JWT payload includes userId and role, set by User Service
    req.user = { userId: decoded.userId, role: decoded.role };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Log token verification errors for debugging
    console.error("User service token error:", err.message);

    // Handle invalid or expired tokens with a 401 status
    res.status(401).json({ message: "Invalid token" });
  }
}
