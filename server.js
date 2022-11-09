const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const _ = require('lodash')
const dbConfig = require('./config/secret');

const app = express();

app.use(cors());
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { User } = require('./Helpers/UserClass');

require('./socket/streams')(io, User, _);
require('./socket/private')(io);

const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes')
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoutes');
const message = require('./routes/messageRoutes');

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


app.use('/api/social', auth);
app.use('/api/social', posts);
app.use('/api/social', users);
app.use('/api/social', friends);
app.use('/api/social', message);

server.listen(4500, () => {
    console.log("Social App listning on 4500 port.!")
})
// app.listen(4500, () => {
//     console.log("Social App listning on 4500 port.!")
// })