const Joi = require('joi');

const userRegisterValidate = (data) => {
    const userSchema = Joi.object({
        name: Joi.string().min(6).max(24).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        passwordConfirm: Joi.string().valid(Joi.ref('password')).required()
    });
    return userSchema.validate(data);
};

const userLoginValidate = (data) => {
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return userSchema.validate(data);
}

const userChangePasswordValidate = (data) => {
    const userSchema = Joi.object({
        currentPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required(),
        passwordConfirm: Joi.string().valid(Joi.ref('newPassword')).required(),
    });
    return userSchema.validate(data);
};

const userForgetPasswordValidate = (data) => {
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
    });
    return userSchema.validate(data);
}

module.exports = {
    userRegisterValidate,
    userLoginValidate,
    userChangePasswordValidate,
    userForgetPasswordValidate
}