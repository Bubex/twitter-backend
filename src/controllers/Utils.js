const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = {
    generateToken(params = {}) {
        return jwt.sign( params, authConfig.secret, {
            expiresIn: authConfig.expiresIn,
        });
    },
    
    sort(a, b) {
        if (a.createdAt < b.createdAt) return 1;
        else if (a.createdAt > b.createdAt) return -1;
        else return 0;
    },
    
    async getProfile(username) {
        try {
            const profile = await User.findOne({ username })
                .populate({ path: 'posts', options: { sort: { 'createdAt': 'desc' }}})
                .populate({ path: 'following', select: 'name username avatar bio createdAt', options: { sort: { 'name' : 'asc' }}})
                .populate({ path: 'followers', select: 'name username avatar bio createdAt', options: { sort: { 'name' : 'asc' }}});
            
            if(profile) return profile;
            else return ({ error: 'User not found.' });
        } catch (err) {
            return ({ error: 'We are unable to access this profile at this time, please try again.' }); 
        }
    },
    
    async getMe(userId) {
        try {
            const user = await User.findById(userId);
            user.password = undefined;
    
            if(user) return user;
            else return ({ error: 'User not found.' });
        } catch (err) {
            return ({ error: 'Failed to load data. Try again.'});
        }
    },

    async timeline(userId) {
        try {
            const { following } = await User.findById(userId)
                .select('following')
                .populate({ 
                    path: 'following', 
                    select: 'posts',
                    populate: {
                        path: 'posts',
                        select: 'text user createdAt',
                        populate: {
                            path: 'user',
                            select: 'avatar name username -_id',
                        }
                    }
                });

            const { posts } = await User.findById(userId)
                .select('posts')
                .populate({
                    path: 'posts', 
                    select: 'text user createdAt',
                    populate: {
                        path: 'user',
                        select: 'avatar name username -_id',
                    }
                });

            let tweets = [];

            following.map(f => {
                f.posts.map(t => {
                    tweets.push(t);
                });
            });

            tweets = tweets.concat(posts);
            tweets = tweets.sort(this.sort);

            if(tweets) return tweets;
            else return ({ error: 'We are unable to load your timeline at this time, please try again.' });
        } catch (err) {
            console.log(err)
            return ({ error: 'We are unable to load your timeline at this time, please try again.'});
        }
    },

    async getRandomUsers(userId, count) {
        try {
            const whoToFollow = await User.find({
                _id: { $ne: userId },
                followers: { $nin: userId }
            });
            
            if(whoToFollow) return whoToFollow;
            else return ({ error: 'Nobody was found.' });
        } catch (err) {
            console.log(err)
            return ({ error: 'Nobody was found.' });
        }
    },
}