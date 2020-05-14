const User = require('../models/User');
const Post = require('../models/Post');

const { findMe, findConnections, sendMessage } = require('../websocket'); 

async function getProfile(username) {
    try {
        const profile = await User.findOne({ username })
            .populate({ path: 'posts', options: { sort: { 'createdAt': 'desc' }}})
            .populate({ path: 'following', select: 'name username avatar bio createdAt', options: { sort: { 'name' : 'asc' }}})
            .populate({ path: 'followers', select: 'name username avatar bio createdAt', options: { sort: { 'name' : 'asc' }}});
        return profile;
    } catch (err) {
        return ({ error: 'We are unable to access this profile at this time, please try again.' }); 
    }
}

async function getMe(id) {
    try {
        const user = await User.findById(id);

        if(user) return user;
        else return ({ error: 'User not found.' });
    } catch (err) {
        return ({ error: 'Failed to load data. Try again.'});
    }
}

module.exports = {
    async list(req, res) {
        try {
            const posts = await Post.find();
            return res.json(posts);
        } catch (err) {
            return res.json({ error: 'Não foi possível listar os tweets.' });
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
            sendMessage(sendSocketMessageTo, 'update-me', await getMe(req.userId));

            const sendSocketMessageTo2 = findConnections(findUser.username);
            sendMessage(sendSocketMessageTo2, 'update-profile', await getProfile(findUser.username));

            return res.json({
                _id: post._id, text: post.text, user: findUser, createdAt: post.createdAt
            });
        } catch (err) {
            return res.json({ error: 'Falha ao postar tweet.' });
        }
    },

    async delete(req, res) {
        const { post_id } = req.body;

        try {
            await Post.findByIdAndDelete(post_id);
            return res.json({ success: 'Tweet deletado com sucesso.' });
        } catch (err) {
            return res.json({ error: 'Falha ao deletar tweet.' });
        }
    },
};