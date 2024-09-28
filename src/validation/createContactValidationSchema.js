import Joi from "joi";

export const createContactValidationSchema = Joi.object({
    name: Joi.string().required().min(3).max(20),
    phoneNumber: Joi.string().required().min(3).max(20),
    email: Joi.string().required().min(3).max(20),
    isFavourite: Joi.boolean(),
    contactType: Joi.string().required().valid('work', 'home', 'personal'),
});