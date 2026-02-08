const Joi = require("joi");

const productSchema = Joi.object({
  season: Joi.string()
    .valid("spring", "summer", "autumn", "winter")
    .required()
    .messages({
      "any.only": "La temporada debe ser spring, summer, autumn o winter",
      "any.required": "La temporada es obligatoria",
    }),
  year: Joi.number().integer().min(2026).max(2050).required().messages({
    "number.base": "El año debe ser un número",
    "number.min": "El año debe ser al menos 2026",
    "number.max": "El año no puede ser mayor a 2050",
    "any.required": "El año es obligatorio",
  }),
  title: Joi.string().min(3).max(255).required().messages({
    "string.min": "El título debe tener al menos 3 caracteres",
    "string.max": "El título no puede exceder 255 caracteres",
    "any.required": "El título es obligatorio",
  }),
  description: Joi.string().min(10).required().messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "any.required": "La descripción es obligatoria",
  }),
  img: Joi.array().items(Joi.string().uri()).min(1).max(5).required().messages({
    "array.min": "Debes proporcionar al menos 1 imagen",
    "array.max": "No puedes subir más de 5 imágenes",
    "any.required": "Las imágenes son obligatorias",
  }),
  sizes: Joi.array()
    .items(Joi.string().valid("S", "M", "L", "XL"))
    .min(1)
    .required()
    .messages({
      "array.min": "Debes seleccionar al menos una talla",
      "any.required": "Las tallas son obligatorias",
    }),
  purchase_link: Joi.string().uri().allow("").default(""),
  color: Joi.array().items(Joi.string().max(50)).min(1).required().messages({
    "array.base": "El campo color debe ser una lista de colores",
    "array.min": "Debes seleccionar al menos un color",
    "any.required": "Los colores son obligatorios",
  }),
  video_url: Joi.string().uri().allow("", null).default(null).messages({
    "string.uri": "La URL del video debe ser válida",
  }),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  productSchema,
  loginSchema,
};
