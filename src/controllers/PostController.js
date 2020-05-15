const User = require('../models/User');
const Post = require('../models/Post');
const utils = require('./Utils');

const { findMe, findConnections, sendMessage } = require('../websocket'); 

module.exports = {
    async list(req, res) {
        try {
            const posts = await Post.find();
            return res.json(posts);
        } catch (err) {
            return res.json({ error: 'Failed to load data. Try again.' });
        }
    },

    async create(req, res) {
        const { text } = req.body;
        const user = req.userId;

        try {
            const post = await Post.create({text, user});

            const findUser = await User.findByIdAndUpdate(user, 
                { $addToSet: { posts: post._id } },
                { new: true, useFindAndModify: false }
            ).select('name username avatar');

            const sendSocketMessageTo = findMe();
            sendMessage(sendSocketMessageTo, 'update-me', await utils.getMe(req.userId));

            const sendSocketMessageTo2 = findConnections(findUser.username);
            sendMessage(sendSocketMessageTo2, 'update-profile', await utils.getProfile(findUser.username));

            return res.json({
                _id: post._id, text: post.text, user: findUser, createdAt: post.createdAt
            });
        } catch (err) {
            return res.json({ error: 'Failed to create tweet. Try again.' });
        }
    },

    async delete(req, res) {
        const { _id } = req.body;
        const user = req.userId;

        try {
            await Post.findByIdAndDelete(_id);

            const findUser = await User.findByIdAndUpdate(user, 
                { $pull: { posts: _id } },
                { new: true, useFindAndModify: false }
            ).select('name username avatar');

            const sendSocketMessageTo = findMe();
            sendMessage(sendSocketMessageTo, 'update-me', await utils.getMe(req.userId));

            const sendSocketMessageTo2 = findConnections(findUser.username);
            sendMessage(sendSocketMessageTo2, 'update-profile', await utils.getProfile(findUser.username));

            return res.json({ success: 'Successfully deleted.' });
        } catch (err) {
            return res.json({ error: 'Failed to delete tweet. Try again.' });
        }
    },
};