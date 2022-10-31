const httpStatus = require('http-status-codes');
const { populate } = require('../models/userModels');
const User = require('../models/userModels');

exports.GetAllUsers = async (req, res, next) => {

    await User.find({})
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('followers.follower').then((data) => {
            return res.status(httpStatus.OK).json({
                message: "Fetched All users",
                results: data
            })
        }).catch(err => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}

exports.GetUser = async (req, res, next) => {

    await User.findOne({ _id: req.params.id })
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('followers.follower').then((data) => {
            return res.status(httpStatus.OK).json({
                message: "User By UserId",
                results: data
            })
        }).catch(err => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}
exports.GetUserByName = async (req, res, next) => {

    await User.findOne({ username: req.params.username })
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('followers.follower').then((data) => {
            return res.status(httpStatus.OK).json({
                message: "User By Username",
                results: data
            })
        }).catch(err => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error occured"
            })
        })
}