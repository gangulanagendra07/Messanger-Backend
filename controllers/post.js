const Joi = require('joi');
const httpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');
const geolocation = require('geolocation');
const Post = require('../models/postModels');
const User = require('../models/userModels');


cloudinary.config({
    cloud_name: 'dgthwirla',
    api_key: '784193769591988',
    api_secret: '18viCKrwt6ISEAFlWBx5n4QuBBQ'
})

exports.AddPost = (req, res) => {
    const schema = Joi.object().keys({
        post: Joi.string()
            .required(),
        image: Joi.string().optional()
    });

    // const reqBody = {
    //     post: req.body.post
    // }

    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
        return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const bodyObj = {
        user: req.user._id,
        username: req.user.username,
        post: req.body.post,
        created: new Date()
    };

    if (req.body.post && !req.body.image) {
        Post.create(bodyObj)
            .then(async post => {
                await User.update(
                    {
                        _id: req.user._id
                    },
                    {
                        $push: {
                            posts: {
                                postId: post._id,
                                post: req.body.post,
                                created: new Date()
                            }
                        }
                    }
                );
                // console.log(post)
                res.status(httpStatus.OK).json({ message: 'Post created', post });
            })
            .catch(err => {
                res
                    .status(httpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error occured' });
            });
    }

    if (req.body.post && req.body.image) {
        cloudinary.uploader.upload(req.body.image, async result => {
            const reqBody = {
                user: req.user._id,
                username: req.user.username,
                post: req.body.post,
                imgId: result.public_id,
                imgVersion: result.version,
                created: new Date()
            };
            Post.create(reqBody)
                .then(async post => {
                    await User.update(
                        {
                            _id: req.user._id
                        },
                        {
                            $push: {
                                posts: {
                                    postId: post._id,
                                    post: req.body.post,
                                    created: new Date()
                                }
                            }
                        }
                    );
                    // console.log(post);
                    res.status(httpStatus.OK).json({ message: 'Post created', post });
                })
                .catch(err => {
                    res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: 'Error occured' });
                });
        });
    }

    // const body = {
    //     user: req.user._id,
    //     username: req.user.username,
    //     post: req.body.post,
    //     created: new Date()
    // }

    // Post.create(body).then(async (data) => {
    //     console.log(data);
    //     await User.updateOne({
    //         _id: req.user._id
    //     }, {
    //         $push: {
    //             posts: {
    //                 postId: data._id,
    //                 post: req.body.post,
    //                 created: new Date()
    //             }
    //         }
    //     })
    //     console.log("data reached")
    //     res.status(httpStatus.OK).json({ message: "post created", data });
    // }).catch(err => {
    //     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error Occured", err });
    // })

}

exports.GetAllPsots = async (req, res) => {

    try {
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(20, 'days');

        // const posts = await Post.find({ created: { $gte: today.toDate(), $lt: tomorrow.toDate() } }).populate('user').sort({ created: -1 });
        // const top = await Post.find({ totalLikes: { $gte: 2 }, created: { $gte: today.toDate(), $lt: tomorrow.toDate() } }).populate('user').sort({ created: -1 });
        const posts = await Post.find({}).populate('user').sort({ created: -1 });
        const top = await Post.find({ totalLikes: { $gte: 2 } }).populate('user').sort({ created: -1 });
        // const user = await User.findOne({ _id: req.user._id });
        // if (!user.city && !user.country) {
        //     request('https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY&ip=2001:4860:4860::1', { json: true }, async (err, res, body) => {
        //         // if (err) {
        //         //     console.log(err);
        //         // }
        //         console.log(body);
        //     });
        // }
        return res.status(httpStatus.OK).json({
            message: "all posts fetched succesfully", posts, top
        })
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "error occured" })
    }

}


exports.AddLike = async (req, res) => {
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