const Joi = require("joi");

const employeeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),

  department_id: Joi.number().integer().required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  address: Joi.string().min(5).max(255).required(),

  designation: Joi.string().min(2).max(100).required(),

  salary: Joi.number().min(0).required(),
});

module.exports = {
  employeeSchema,
};
