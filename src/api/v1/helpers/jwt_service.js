const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const redisClient = require('../../../config/db/redis');

const signAccessToken = async (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_ACCESS_KEY, { expiresIn: `${process.env.ACCESS_EXPIRED_IN}s` }, (err, accessToken) => {
            if(err)
                return reject(err);
            return resolve(accessToken);
        }); 
    });
}

const signRefreshToken = async (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_REFRESH_KEY, { expiresIn: `${process.env.REFRESH_EXPIRED_IN}s` }, (err, refreshToken) => {
            if(err){
                console.log('111')
                return reject(err);
            }
               
            redisClient.set(payload._id.toString(), refreshToken, 'EX', process.env.REFRESH_EXPIRED_IN, (err, reply) => {
                if(err){
                    return reject(createError.InternalServerError());
                }
                return resolve(refreshToken);
            });
        }); 
    });
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        // Verify token
        jwt.verify(refreshToken, process.env.SECRET_REFRESH_KEY, (err, payload) => {
            if(err)
                return reject(err);
            redisClient.get(payload._id.toString(), (err, reply) => {
                if(err){
                    return reject(createError.InternalServerError());
                }
                if(refreshToken === reply){
                    return resolve(payload);
                }
                return reject(createError.Unauthorized());
            })
        });
    });
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
}