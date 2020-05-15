const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { findMe, findConnections, sendMessage } = require('../websocket'); 
const utils = require('./Utils');

module.exports = {
    async index(req, res) {
        const me = await utils.getMe(req.userId);
        res.json(me);
    },

    async register(req, res) {
        const { username, name, email, password } = req.body;

        try {
            let usernameExists = await User.findOne({ username });
            let emailExists = await User.findOne({ email });

            if( !username || !name || !email || !password ){
                return res.json({ error: 'Fill in all required fields.' });
            } else if( emailExists && usernameExists ){
                return res.json({ error: 'This email and username already exists.' });
            } else if( emailExists ) {
                return res.json({ error: 'This email is already registered.' });
            } else if( usernameExists ) {
                return res.json({ error: 'This username already exists.' });
            } else {
                const user = await User.create({ 
                    username, name, email, password
                });
                
                return res.json({
                    user,
                    token: utils.generateToken({ id: user._id })
                });
            }
        } catch (err) {
            return res.json({ error: 'Failed to register. Try again.' });
        }
    },

    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email }).select('+password').populate({ path: 'posts', options: { sort: { 'createdAt': 'desc' }}});

            if(!user){
                return res.json({ error: 'Email not registered.' });
            }

            if(!await bcrypt.compare(password, user.password)) {
                return res.json({ error: 'Incorrect password.' });
            }
            
            user.password = undefined;

            return res.json({ 
                user, 
                token: utils.generateToken({ id: user._id })
            });
        } catch (err) {
            console.log(err)
            return res.json({ error: 'Failed to login. Try again.' });
        }
    },

    async sendImage(req, res) {
        const { filename: path } = req.file;
        const fullLink = `${process.env.APP_URL}images/${path}`;
        return res.json({ path: fullLink });
    },

    async profile(req, res) {
        const profile = await utils.getProfile(req.params.username);
        res.json(profile);
    },

    async follow(req, res) {
        const { username } = req.params;
        const myUser = req.userId;

        try {
            const user = await User.findOneAndUpdate(
                { username },
                { $addToSet: { followers: myUser } },
                { new: true, useFindAndModify: false }
            );

            const me = await User.findByIdAndUpdate(
                myUser,
                { $addToSet: { following: user._id } },
                { new: true, useFindAndModify: false }
            );

            const sendSocketMessageTo = findConnections(username);
            sendMessage(sendSocketMessageTo, 'update-profile', await utils.getProfile(username));

            const sendSocketMessageTo2 = findMe();
            sendMessage(sendSocketMessageTo2, 'update-me', await utils.getMe(user._id));

            return res.json({ success: 'Now you are following him!'});
        } catch (err) {
            console.log(err)
            return res.json({ error: 'We are unable to access this profile at this time, please try again.' }); 
        }
    },

    async unfollow(req, res) {
        const { username } = req.params;
        const myUser = req.userId;

        try {
            const user = await User.findOneAndUpdate(
                { username },
                { $pull: { followers: myUser } },
                { new: true, useFindAndModify: false }
            );

            const me = await User.findByIdAndUpdate(
                myUser,
                { $pull: { following: user._id } },
                { new: true, useFindAndModify: false }
            );

            const sendSocketMessageTo = findConnections(username);
            sendMessage(sendSocketMessageTo, 'update-profile', await utils.getProfile(username));

            const sendSocketMessageTo2 = findMe();
            sendMessage(sendSocketMessageTo2, 'update-me', await utils.getMe(user._id));

            return res.json({ success: 'You are not following him.'});
        } catch (err) {
            return res.json({ error: 'We are unable to access this profile at this time, please try again.' }); 
        }
    },

    async timeline(req, res) {
        const timeline = await utils.timeline(req.userId);
        res.json(timeline);
    },

    async update(req, res) {
        try {
            const { username, name, location, website, bio, avatar, cover } = req.body;

            const me = await User.findByIdAndUpdate(req.userId, {
                username, name, location, website, bio, avatar, cover
            });

            const sendSocketMessageTo = findMe();
            sendMessage(sendSocketMessageTo, 'update-me', await utils.getMe(req.userId));

            const sendSocketMessageTo2 = findConnections(me.username);
            sendMessage(sendSocketMessageTo2, 'update-profile', await utils.getProfile(me.username));
    
            return res.json({ success: 'Your profile has been updated successfully!' });
        } catch (err) {
            return res.json({ error: 'Failed to save your profile. Try again.' });
        }
    },

    async whoToFollow(req, res) {
        const { count } = req.body;
        const users = await utils.getRandomUsers(req.userId, count);
        res.json(users);
    },
};