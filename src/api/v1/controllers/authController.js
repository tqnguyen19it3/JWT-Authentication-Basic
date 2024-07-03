const createError = require('http-errors');
const { userRegisterValidate, userLoginValidate, userForgetPasswordValidate, userChangePasswordValidate} = require('../validations/authValidate');
const authService = require('../services/authService');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_service');
const { sendMailCreateAccount, sendMailForgetPassword } = require('../helpers/sendMail');
const redisClient = require('../../../config/db/redis');


//---------------- Models ----------------
const userModel = require('../models/userModel');


// [POST] / register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // validate all fields
        const { error } = userRegisterValidate(req.body);
        if(error){
            throw createError(error.details[0].message);
        }

        // store 1 user in mongodb from authService
        const user = await authService.createUser({ name, email, password });
       
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

        const user = await authService.loginUser({ email, password });

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
        let userID = req.payload._id;
        await authService.changeUserPassword({ userID, currentPassword, newPassword });

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

        const user = await authService.forgetUserPassword({ email });
        
        await sendMailForgetPassword(
            email,
            user.name,
            "Reset Your Password",
            user.passwordGen,
            `<p>Your password is: ${user.passwordGen}</p>`
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
