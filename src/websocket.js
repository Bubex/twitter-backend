const socketio = require('socket.io');

const connections = [];
let io;

exports.setupWebSocket = (server) => {
    io = socketio(server);

    io.on('connection', socket => {
        const { me, listening } = socket.handshake.query;

        connections.push({
            id: socket.id,
            me,
            listening
        });
    });
};

exports.findMe = () => {
    return connections.filter(connection => {
        return connection.listening === connection.me;
    })
}

exports.findConnections = (listening) => {
    return connections.filter(connection => {
        return connection.listening === listening;
    })
}

exports.sendMessage = (to, message, data) => {
    to.forEach(connection => {
        io.to(connection.id).emit(message, data);
    });
};