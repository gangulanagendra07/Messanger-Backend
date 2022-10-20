const httpStatus = require('http-status-codes');
const { updateOne } = require('../models/userModels');
const User = require('../models/userModels');

exports.followUser = (req, res, next) => {

    const followUser = async () => {
        await User.updateOne({
            _id: req.user._id,
            'following.userFollowed': { $ne: req.body.userFollowed }
        },
            {
                $push: {
                    following: {
                        userFollowed: req.body.userFollowed
                    }
                }
            })

        await User.updateOne({
            _id: req.body.userFollowed,
            'following.follower': { $ne: req.user._id }
        },
            {
                $push: {
                    followers: {
                        follower: req.user._id
                    },
                    notifications: {
                        senderId: req.user._id,
                        message: `${req.user.username} is now following you.!`,
                        created: new Date()
                    }
                }
            })
    }

    followUser().then((data) => {
        return res.status(httpStatus.OK).json({
            message: "Following user now",
            result: data
        })
    }).catch(err => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error occured",
        })
    })

}

exports.unfollowUser = (req, res, next) => {

    const unfollowUser = async () => {
        await User.updateOne({
            _id: req.user._id
        },
            {
                $pull: {
                    following: {
                        userFollowed: req.body.userFollowed
                    }
                }
            })

        await User.updateOne({
            _id: req.body.userFollowed
        },
            {
                $pull: {
                    followers: {
                        follower: req.user._id
                    }
                }
            })
    }

    unfollowUser().then((data) => {
        return res.status(httpStatus.OK).json({
            message: "UnFollowing user now",
            result: data
        })
    }).catch(err => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error occured",
        })
    })

}

exports.markNotification = async (req, res, next) => {
    if (!req.body.deleteValue) {
        await User.updateOne({
            _id: req.user._id,
            'notifications._id': req.params.id
        }, {
            $set: {
                'notifications.$.read': true
            }
        }).then((data) => {
            return res.status(httpStatus.OK).json({
                message: "Mark as read"
            })
        }).catch(err => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error Occured"
            })
        })
    } else {
        await User.updateOne({
            _id: req.user._id,
            'notifications._id': req.params.id
        }, {
            $pull: {
                notifications: { _id: req.params.id }
            }
        }).then((data) => {
            return res.status(httpStatus.OK).json({
                message: "deleted Notification successfully"
            })
        }).catch(err => {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error Occured"
            })
        })
    }
}
exports.markAllNotifications = async (req, res, next) => {
    await User.updateOne({
        _id: req.user._id
    },
        { $set: { 'notifications.$[elem].read': true } },
        { arrayFilters: [{ 'elem.read': false }], multi: true }
    ).then((data) => {
        return res.status(httpStatus.OK).json({
            message: "Marked all notifications successfully"
        })
    }).catch(err => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error Occured"
        })
    })
}

