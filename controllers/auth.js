const Joi = require('joi');
const cluster = require('cluster');
const httpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const helpers = require('../Helpers/helpers');
const config = require('../config/secret');
// const { firstUpper, lowercase } = require('../Helpers/helpers');


exports.CreateUser = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            username: Joi.string()
                .alphanum()
                .min(5)
                .max(15)
                .required(),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            password: Joi.string().required(),

        });

        const { error, value } = schema.validate(req.body);
        if (error && error.details) {
            return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
        }

        const userEmail = await User.findOne({ email: helpers.lowercase(req.body.email) });
        if (userEmail) {
            return res.status(httpStatus.CONFLICT).json({
                message: "email already exists.!"
            })
        }
        const userName = await User.findOne({ username: helpers.firstUpper(req.body.username) });
        if (userName) {
            return res.status(httpStatus.CONFLICT).json({ message: "username already exists.!" });
        }

        return bcrypt.hash(value.password, 10, (err, hash) => {
            if (err) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "Error Occured while hashing the password" });
            }

            const body = {
                username: helpers.firstUpper(value.username),
                email: helpers.lowercase(value.email),
                password: hash
            }
            User.create(body).then((results) => {
                const token = jwt.sign({ data: results }, config.secret, {
                    expiresIn: '5h'
                })
                // const cookieOptions = {
                //     expires: new Date(
                //         Date.now() + 90 * 24 * 60 * 60 * 1000
                //     ),
                //     httpOnly: true
                // };
                // cookieOptions.secure = true;
                res.cookie("jwt", token);
                // cluster.worker.kill();
                return res.status(httpStatus.CREATED).json({
                    message: "User data updated succesfully.!",
                    data: results,
                    token
                })

            }).catch((err) => {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    message: `Error occured.!`
                })
            })
        })
    } catch (err) {
        // cluster.worker.kill();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `${err}`
        })
    }
}
exports.LoginUser = async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            msg: "No empty fields allowed"
        })
    }

    const user = await User.findOne({ username: helpers.firstUpper(req.body.username) });
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: "Please Sign Up.!"
        })
    }

    return bcrypt.compare(req.body.password, user.password).then(data => {
        user.password = undefined;
        if (!data) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Password doesn't match.!"
            })
        }
        const token = jwt.sign({ data: user }, config.secret, {
            expiresIn: '5h'
        })

        // const cookieOptions = {
        //     expires: new Date(
        //         Date.now() + 90 * 24 * 60 * 60 * 1000
        //     ),
        //     httpOnly: true
        // };
        // cookieOptions.secure = true;        
        // cluster.worker.kill();
        res.cookie('auth', token);
        return res.status(httpStatus.OK).json({
            message: " Login successfully",
            data: user,
            token
        })

    }).catch((err) => {
        // cluster.worker.kill();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error occured"
        })
    })
}