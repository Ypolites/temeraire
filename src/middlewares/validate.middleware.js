/**
 * Validation Middleware
 *
 * Validates req.body against a Zod schema.
 * Returns a 400 error if validation fails.
 *
 * @param {import("zod").ZodSchema} schema
 */

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
  
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return res.status(400).json({ success: false, errors });
    }
  
    req.body = result.data;
    next();
  };
  
  module.exports = validate;