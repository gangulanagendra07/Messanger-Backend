const httpStatus = require('http-status-codes');
const Message = require('../models/messageModels');
const Conversation = require('../models/conversationModels');
const User = require('../models/userModels');
const Helper = require('../Helpers/helpers');


exports.GetAllMessages = async (req, res, next) => {
    try {
        const { sender_Id, receiver_Id } = req.params;
        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [{ 'participants.senderId': sender_Id }, { 'participants.receiverId': receiver_Id }]
                },
                {
                    $and: [{ 'participants.senderId': receiver_Id }, { 'participants.receiverId': sender_Id }]
                }
            ]
        }).select('_id')

        if (conversation) {
            const messages = await Message.findOne({ conversationId: conversation._id })
            res.status(httpStatus.OK).json({
                message: "Messages returned",
                messages
            });
        }
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error Occured",
            err
        });
    }

}

exports.SendMessage = (req, res, next) => {
    const { sender_Id, receiver_Id } = req.params;

    Conversation.find({
        $or: [
            {
                participants: {
                    $elemMatch: { senderId: sender_Id, receiverId: receiver_Id }
                }
            },
            {
                participants: {
                    $elemMatch: { senderId: receiver_Id, receiverId: sender_Id }
                }
            }
        ]
    },
        async (err, result) => {
            if (result.length > 0) {
                const msg = await Message.findOne({ conversationId: result[0]._id });
                Helper.updateCheckList(req, msg);
                await Message.update(
                    {
                        conversationId: result[0]._id
                    },
                    {
                        $push: {
                            message: {
                                senderId: req.user._id,
                                receiverId: req.params.receiver_Id,
                                sendername: req.user.username,
                                receivername: req.body.receiverName,
                                body: req.body.message
                            }
                        }
                    }
                )
                    .then(() =>
                        res
                            .status(httpStatus.OK)
                            .json({ message: 'Message sent successfully' })
                    )
                    .catch(err =>
                        res
                            .status(httpStatus.INTERNAL_SERVER_ERROR)
                            .json({ message: 'Error occured' })
                    );
            } else {
                const newConversation = new Conversation();
                newConversation.participants.push({
                    senderId: req.user._id,
                    receiverId: req.params.receiver_Id
                })

                const saveConversation = await newConversation.save();
                // console.log(saveConversation);
                const newMessage = new Message();
                newMessage.conversationId = saveConversation._id,
                    newMessage.sender = req.user.username,
                    newMessage.receiver = req.body.receiverName,
                    newMessage.message.push({
                        senderId: req.user._id,
                        receiverId: req.params.receiver_Id,
                        sendername: req.user.username,
                        receivername: req.body.receiverName,
                        body: req.body.message

                    });

                await User.updateOne({
                    _id: req.user._id
                }, {
                    $push: {
                        chatList: {
                            $each: [{
                                receiverId: req.params.receiver_Id,
                                msgId: newMessage._id
                            }],
                            $position: 0
                        }
                    }
                });

                await User.updateOne({
                    _id: req.params.receiver_Id
                }, {
                    $push: {
                        chatList: {
                            $each: [{
                                receiverId: req.user._id,
                                msgId: newMessage._id
                            }],
                            $position: 0
                        }
                    }
                });

                await newMessage.save().then(() => {
                    res.status(httpStatus.OK).json({
                        message: "Message sent"
                    })
                }).catch(err => {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                        message: "Error Occured",
                        err
                    })
                })
            }
        })
}

exports.MarkReceivedMessages = async (req, res, next) => {
    const { sender, receiver } = req.params;
    const msg = await Message.aggregate([
        { $unwind: '$message' },
        {

            $match: {
                $and: [
                    { 'message.sendername': receiver, 'message.receivername': sender }
                ]
            }
        }])
    if (msg.length > 0) {
        try {
            msg.forEach(async (value) => {
                await Message.update({
                    'message._id': value.message._id
                }, {
                    $set: {
                        'message.$.isRead': true
                    }
                });
            });
            res.status(httpStatus.OK).json({ message: "Messages marked as Read" })
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error Occured" })
        }
    }
}

exports.MarkAllMessages = async (req, res, next) => {
    const msg = await Message.aggregate([
        { $match: { 'message.receivername': req.user.username } },
        { $unwind: '$message' },
        { $match: { 'message.receivername': req.user.username } },

    ])
    if (msg.length > 0) {
        try {
            msg.forEach(async (value) => {
                await Message.updateMany({
                    'message._id': value.message._id
                }, {
                    $set: {
                        'message.$.isRead': false
                    }
                });
            });
            res.status(httpStatus.OK).json({ message: " All Messages marked as Read" })
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error Occured" })
        }
    }
}