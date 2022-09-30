const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secret');
const httpStatus = require('http-status-codes');

module.exports = {
    VerifyToken: (req, res, next) => {

        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.auth) {
            token = req.cookies.auth;
        }
        // console.log(req.cookies);
        if (!token) {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'No token provided.!' })
        }
        return jwt.verify(token, dbConfig.secret, (err, decoded) => {
            if (err) {
                if (err.expiredAt < new Date()) {
                    return res.status().json({
                        message: 'Token has expired. Please Login again',
                        token: null
                    });
                }
                next();
            }
            req.user = decoded.data;
            // console.log(req.user);
            next();
        });
    }
}