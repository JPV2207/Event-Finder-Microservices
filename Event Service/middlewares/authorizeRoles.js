/**
 * Middleware factory to restrict access based on user roles
 * Returns a middleware function that checks if the user's role is in the allowed roles list
 * @param {string[]} roles - Array of roles permitted to access the route
 */
export function authorizeRoles(roles) {
  return (req, res, next) => {
    // Check if the user's role (from req.user) is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      // Return 403 status if the user's role is not allowed
      return res.status(403).json({ error: "Access denied" });
    }

    // Proceed to the next middleware or route handler if role is allowed
    next();
  };
}
