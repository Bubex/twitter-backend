// DEPENDENCIES
const express = require('express');
const multer = require('multer');

// IMPORTING MIDDLEWARES AND CONFIGS
const authMiddleware = require('./middlewares/auth');
const multerConfig = require('./config/multer');

// IMPORTING CONTROLLERS
const UserController = require('./controllers/UserController');
const PostController = require('./controllers/PostController');

// STARTING ROUTES MANAGER
const routes = express.Router();
const upload = multer(multerConfig);

// -- PUBLIC ROUTES
routes.post('/auth/register', UserController.register);
routes.post('/auth/login', UserController.login);

// -- AUTHENTICATED ROUTES WITH JWT
routes.use(authMiddleware.main);

// ---------- Index
    routes.get('/index', UserController.index);
// ---------- Dashboard
    routes.get('/timeline', UserController.timeline);
    routes.post('/who-to-follow', UserController.whoToFollow);
// ---------- Upload Profile
    routes.post('/update', UserController.update);
    routes.post('/pictures/upload', upload.single('file'), UserController.sendImage);
// ---------- User Interactions
    routes.get('/profile/:username', UserController.profile);
    routes.post('/profile/:username/follow', UserController.follow);
    routes.post('/profile/:username/unfollow', UserController.unfollow);
// ---------- List, Create and Delete Tweets
    routes.get('/posts', PostController.list);
    routes.post('/post', PostController.create);
    routes.post('/post/delete', PostController.delete);

// EXPORTING ROUTES
module.exports = routes;