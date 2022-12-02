const httpStatus = require('http-status-codes');
// const cluster = require('cluster');
const moment = require('moment');
// const { populate } = require('../models/userModels');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');


exports.GetAllUsers = (req, res) => {

    User.find({})
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
        .populate('followers.follower').then((data) => {
            // cluster.worker.kill();
            return res.status(httpStatus.OK).json({
                message: "Fetched All users",
                results: data
            })
        }).catch(err => {
            // cluster.worker.kill()
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}

exports.GetUser = (req, res, next) => {

    User.findOne({ _id: req.params.id })
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
        .populate('followers.follower').then((data) => {
            // cluster.worker.kill()
            return res.status(httpStatus.OK).json({
                message: "User By UserId",
                results: data
            })
        }).catch(err => {
            // cluster.worker.kill()
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}
exports.GetUserByName = (req, res, next) => {

    User.findOne({ username: req.params.username })
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
        .populate('followers.follower').then((data) => {
            // cluster.worker.kill()
            return res.status(httpStatus.OK).json({
                message: "User By Username",
                results: data
            })
        }).catch(err => {
            // cluster.worker.kill()
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}

exports.ProfileView = (req, res) => {
    const dateValue = moment().format('YYYY-MM-DD');
    User.updateOne({
        _id: req.body.id,
        'notifications.date': { $ne: [dateValue, ''] },
        'notifications.senderId': { $ne: req.user._id }
    },
        {
            $push: {
                notifications: {
                    senderId: req.user._id,
                    message: `${req.user.username} viewed your profile`,
                    created: new Date(),
                    date: dateValue,
                    viewProfile: true
                }
            }
        }
    ).then((data) => {
        // cluster.worker.kill()
        return res.status(httpStatus.OK).json({
            message: "Notification sent"
        })
    }).catch(err => {
        // cluster.worker.kill()
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error occured"
        })
    })
}

exports.ChangePassword = async (req, res) => {
    const schema = Joi.object().keys({
        cPassword: Joi.string().required(),
        newPassword: Joi.string().min(5).required(),
        confirmPassword: Joi.string().min(5).required()
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
        return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const user = await User.findOne({ _id: req.user._id });

    return bcrypt.compare(value.cPassword, user.password).then(async (result) => {
        if (!result) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Current password is incorrect' });
        }
        const newpassword = await User.EncryptPassword(req.body.newPassword);

        await User.updateOne({
            _id: req.user._id
        },
            {
                password: newpassword
            }).then((data) => {
                // cluster.worker.kill()
                return res.status(httpStatus.OK).json({
                    message: "Password updated successfully"
                })
            }).catch(err => {
                // cluster.worker.kill()
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error occured"
                })
            })

    }).catch(err => {
        // cluster.worker.kill()
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error occured"
        })
    })

}