const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isImageUrl = require('is-image-url');

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
        select: false,
    },
    bio: {
        type: String,
        require: false
    },
    location: {
        type: String,
        require: false
    },
    website: {
        type: String,
        require: false
    },
    avatar: {
        type: String,
        require: false,
        default: `${process.env.APP_URL}images/default-avatar.png`
    },
    cover: {
        type: String,
        require: false,
        default: `${process.env.APP_URL}images/default-cover.jpg`
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ENCRYPTING PASSWORD
UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    this.avatar = await isImageUrl(this.avatar) ? this.avatar : `${process.env.APP_URL}images/default-avatar.png`;
    this.cover = await isImageUrl(this.cover) ? this.cover : `${process.env.APP_URL}images/default-cover.jpg`;

    next();
});

module.exports = mongoose.model('User', UserSchema);