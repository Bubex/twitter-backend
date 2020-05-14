const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const routes = require('./routes');
const path = require('path');

const { setupWebSocket } = require('./websocket');

const app = express();
const server = http.Server(app);

setupWebSocket(server);

mongoose.connect('mongodb+srv://tester:sucesso2020@cluster0-rcyph.mongodb.net/test?retryWrites=true&w=majority', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.resolve('__dirname', '..', 'tmp', 'uploads')));
app.use(routes);

server.listen(3333);