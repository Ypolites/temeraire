/**
 * Auth Middleware
 *
 * Verifies the JWT token sent in the Authorization header.
 * Attaches the decoded user payload to req.user.
 *
 * Expected header format: Authorization: Bearer <token>
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      errors: ["Authentification requise."],
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      errors: ["Token invalide ou expiré."],
    });
  }
};

module.exports = authMiddleware;