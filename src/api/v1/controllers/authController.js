const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { userRegisterValidate, userLoginValidate, userForgetPasswordValidate, userChangePasswordValidate} = require('../validations/authValidate');
const { generateRandomPassword } = require('../utils/generate_random_password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_service');
const { sendMailCreateAccount, sendMailForgetPassword } = require('../helpers/sendMail');
const redisClient = require('../../../config/db/redis');


//---------------- Models ----------------
const userModel = require('../models/userModel');


// [POST] / register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;
        // validate all fields
        const { error } = userRegisterValidate(req.body);
        if(error){
            throw createError(error.details[0].message);
        }
        // check email exits
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw createError.Conflict(`Register Failed! ${email} already exists`);
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // store 1 user in mongodb
        const user = await userModel.create({
            name,
            email,
            password: hashPassword,
        });
        // send mail to user
        await sendMailCreateAccount(
            email,
            name,
            "Create account",
            `<p>Your email is: ${email}. Congratulations! We are pleased to inform you that you have successfully passed the account registration stage.</p>`
        );
        return res.status(200).json({
            message: "Register Successfully!",
            user
        });

    } catch (error) {
        next(error);
    }
}

// [POST] / login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // validate all fields
        const { error } = userLoginValidate(req.body);
        if(error){
            throw createError(error.details[0].message);
        }
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
        // create jwt when login success
        const payload = {
            _id: user._id,
            name: user.name,
            email: user.email
        }
        const accessTokenUser = await signAccessToken(payload);
        const refreshTokenUser = await signRefreshToken(payload);
        return res.status(200).json({
            message: "Login successfully!", 
            accessToken: accessTokenUser,
            refreshToken: refreshTokenUser
        });

    } catch (error) {
        next(error);
    }
}

// [DELETE] / logout
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken){
            throw createError.BadRequest();
        } 
        const { _id } = await verifyRefreshToken(refreshToken);
        redisClient.del(_id, (err, reply) => {
            if(err){
                throw createError.InternalServerError();
            } 
            res.status(200).json({
                'message': 'Logout Successfully!'
            })
        });
    } catch (error) {
        next(error);
    }
}

// [PUT] / change password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, passwordConfirm } = req.body;
        // validate all fields
        const { error } = userChangePasswordValidate(req.body);
        if(error){
            throw createError(error.details[0].message);
        }
        // check user exits
        const user = await userModel.findById(req.payload._id);
        if (!user) {
            throw createError.NotFound();
        }

        //check password
        const isPassValid = await bcrypt.compareSync(currentPassword, user.password);
        if(!isPassValid){
            throw createError.Unauthorized("Old password is invalid!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashPassword;

        await user.save();

        return res.status(200).json({
            message: "Password change successful!", 
        });

    } catch (error) {
        next(error);
    }
}

// [POST] / rest password when forget
exports.forgotPassword  = async (req, res, next) => {
    try {
        const { email } = req.body;
        const { error } = userForgetPasswordValidate(req.body);
        if(error){
            throw createError(error.details[0].message);
        }
        //check user exits
        const user = await userModel.findOne({ email });
        if(!user){
            throw createError.NotFound(`Failed! ${email} not registered`);
        }
        // create new password
        const password  = await generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // update new password in db
        await userModel.updateOne({ email: email }, { password: hashPassword });

        await sendMailForgetPassword(
            email,
            user.name,
            "Reset Your Password",
            password,
            `<p>Your password is: ${password}</p>`
        );

        return res.status(200).json({
            message: "You should receive an email!",
        });
        
    } catch (error) {
        next(error);
    }
}

// [POST] / refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();

        const { _id, name, email } = await verifyRefreshToken(refreshToken);
        const accessTokenUser = await signAccessToken({ _id, name, email });
        const refreshTokenUser = await signRefreshToken({ _id, name, email });

        res.status(200).json({ 
            message: "RefreshToken successfully!",
            accessTokenUser, 
            refreshTokenUser 
        });
    } catch (error) {
        next(error);
    }
}

// [GET] / list user
exports.getListUser = async (req, res, next) => {
    try {
        const users = await userModel.find();
        return res.status(200).json({
            message: "Get List Users Successfully!",
            users
        });
    } catch (error) {
        next(error);
    }
}
