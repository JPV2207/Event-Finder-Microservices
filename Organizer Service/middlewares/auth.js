// Import JSON Web Token library for token verification
import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using a JWT token
 * Verifies the token and attaches user data from the token payload to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function authenticateToken(req, res, next) {
  // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if token is missing
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    // Verify the JWT using the secret key from environment variables
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data (userId and role) from token payload to the request
    // Note: In microservices, trust the token payload created by User Service; do not fetch from DB
    req.user = {
      userId: verified.userId, // Extract userId from token payload
      role: verified.role, // Extract role from token payload
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle invalid or expired tokens with a 400 status
    res.status(400).json({ error: "Invalid token" });
  }
}
