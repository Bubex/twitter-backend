const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    text: {
        type: String,
        maxlength: 280,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);