/**
 * Middleware factory to restrict access based on user roles
 * Returns a middleware function that checks if the user's role is in the allowed roles list
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 * @returns {Function} Middleware function for Express
 */
export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    // Check if user is authenticated and has a valid user ID
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get the user's role from the request object
    const userRole = req.user.role;

    // Allow access if the user's role is in the allowed roles list
    if (allowedRoles.includes(userRole)) {
      next(); // Proceed to the next middleware or route handler
    } else {
      // Deny access with a 403 status if the role is not allowed
      return res
        .status(403)
        .json({ error: "Access denied: Insufficient role" });
    }
  };
}
