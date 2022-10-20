const Joi = require('joi');
const httpStatus = require('http-status-codes');
const Post = require('../models/postModels');
const User = require('../models/userModels');


exports.AddPost = (req, res, next) => {
    const schema = Joi.object().keys({
        post: Joi.string()
            .required()
    });

    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
        return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const body = {
        user: req.user._id,
        username: req.user.username,
        post: req.body.post,
        created: new Date()
    }

    Post.create(body).then(async (data) => {
        console.log(data);
        await User.updateOne({
            _id: req.user._id
        }, {
            $push: {
                posts: {
                    postId: data._id,
                    post: req.body.post,
                    created: new Date()
                }
            }
        })
        console.log("data reached")
        res.status(httpStatus.OK).json({ message: "post created", data });
    }).catch(err => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error Occured", err });
    })

}

exports.GetAllPsots = async (req, res, next) => {

    try {

        const posts = await Post.find({}).populate('user').sort({ created: -1 });
        const top = await Post.find({ totalLikes: { $gte: 2 } }).populate('user').sort({ created: -1 });
        return res.status(httpStatus.OK).json({
            message: "all posts fetched succesfully", posts, top
        })
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "error occured" })
    }

}


exports.AddLike = async (req, res, next) => {
    const postId = req.body._id;
    await Post.updateOne(
        {
            _id: postId,
            'likes.username': { $ne: req.user.username }
        },
        {
            $push: {
                likes: {
                    username: req.user.username
                }
            },
            $inc: {
                totalLikes: 1
            }
        }
    ).then(() => {
        res.status(httpStatus.OK).json({
            message: "you liked the post"
        })
    }).catch((err) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error occured" })
    })
}

exports.AddComment = async (req, res, next) => {
    const postId = req.body.postId;
    await Post.updateOne(
        {
            _id: postId,
        },
        {
            $push: {
                comments: {
                    userId: req.user._id,
                    username: req.user.username,
                    comment: req.body.comment,
                    createdAt: new Date()
                }
            }
        }
    ).then(() => {
        res.status(httpStatus.OK).json({
            message: "added comment to post"
        })
    }).catch((err) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error occured" })
    })
}

exports.GetPost = async (req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id }).populate('user').populate('comments.userId')
        if (!post) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "post not found" });
        }
        return res.status(httpStatus.OK).json({ message: "Post found", post });

    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "error occured", err });
    }
}