const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dbConfig = require('./config/secret');

const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(logger('dev'));

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}
).then(() => {
    console.log("MongoDB Connected Successfully.!")
}).catch((err) => {
    console.log(err);
})

require('./socket/streams')(io);

const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes')

app.use('/api/social', auth);
app.use('/api/social', posts);

server.listen(4500, () => {
    console.log("Social App listning on 4500 port.!")
})
// app.listen(4500, () => {
//     console.log("Social App listning on 4500 port.!")
// })