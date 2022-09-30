const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String, required: true },
    posts: [
        {
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
            post: { types: String, default: '' },
            created: { type: Date, default: Date.now() }
        }
    ]
})

module.exports = mongoose.model("User", userSchema)