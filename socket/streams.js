module.exports = function (io) {
    io.on('connection', socket => {
        console.log("User Connected");
        socket.on('refresh', (data) => {
            io.emit('refreshPage', {});
        })
    });

}