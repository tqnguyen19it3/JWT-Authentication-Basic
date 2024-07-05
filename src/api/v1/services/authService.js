const createError = require('http-errors');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateRandomPassword } = require('../utils/generate_random_password');
const genHash = require('../utils/genHash');

const createUser = async ({ name, email, password }) => {
    // check email exits
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw createError.Conflict(`Register Failed! ${email} already exists`);
    }
    const hashPassword = await genHash.genHashPassword(password);
    // store 1 user in mongodb
    const user = await userModel.create({
        name,
        email,
        password: hashPassword,
    });

    return user;
};

const loginUser = async ({ email, password }) => {
    //check user exits
    const user = await userModel.findOne({ email });
    if(!user){
        throw createError.NotFound(`Login Failed! ${email} not registered`);
    }
    //check password
    const isPassValid = bcrypt.compareSync(password, user.password);
    if(!isPassValid){
        throw createError.Unauthorized();
    }

    return user;
};

const changeUserPassword = async ({ userID, currentPassword, newPassword }) => {
    // check user exits
    const user = await userModel.findById(userID);
    if (!user) {
        throw createError.NotFound();
    }

    //check password
    const isPassValid = await bcrypt.compareSync(currentPassword, user.password);
    if(!isPassValid){
        throw createError.Unauthorized("Old password is invalid!");
    }
    const hashPassword = await genHash.genHashPassword(password);
    user.password = hashPassword;

    await user.save();
}

const forgetUserPassword = async ({ email }) => {
    //check user exits
    const user = await userModel.findOne({ email });
    if(!user){
        throw createError.NotFound(`Failed! ${email} not registered`);
    }
    // create new password
    const password  = await generateRandomPassword();
    const hashPassword = await genHash.genHashPassword(password);
    // update new password in db
    await userModel.updateOne({ email: email }, { password: hashPassword });
    user.passwordGen = password;

    return user;
}

module.exports = {
    createUser,
    loginUser,
    changeUserPassword,
    forgetUserPassword
};
