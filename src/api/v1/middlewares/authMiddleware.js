const jwt = require('jsonwebtoken');
const createError = require('http-errors');


const isAuthentication = (req, res, next) => {
    try {
        // 1. Get token from client
        const bearerHeader = req.headers['authorization'];
        if(!bearerHeader){
            return next(createError.Unauthorized());
        }
        const accessToken = bearerHeader.split(' ')[1];
        // 2. verify token
        jwt.verify(accessToken, process.env.SECRET_ACCESS_KEY, (err, payload) => {
            if(err)
                return next(createError.Unauthorized(err.message));
            req.payload = payload;
            next();
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    isAuthentication
}