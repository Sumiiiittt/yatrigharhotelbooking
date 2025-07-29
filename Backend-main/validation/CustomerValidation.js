const Joi = require("joi");

const customerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required().email(),
  contact_no: Joi.string().optional(),
});

function CustomerValidation(req, res, next) {
  const { username, email, contact_no } = req.body;

  // Validate the request body using the schema
  const { error } = customerSchema.validate({ username, email, contact_no });

  // If validation fails, return a structured error response
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((err) => err.message), // Get detailed error messages
    });
  }

  // If validation passes, proceed to the next middleware or controller
  next();
}

module.exports = CustomerValidation;
