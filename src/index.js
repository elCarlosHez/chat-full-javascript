//import { createServer } from 'http';
const http = require('http');
const path = require('path');

const express = require('express');
const socketio = require('socket.io');

const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

//settings
app.set('port',process.env.PORT || 3000);

require('./sockets')(io);


// db connection
mongoose.connect('mongodb://localhost/chat-database')
        .then(db => console.log('Data base is connected'))
        .catch(err => console.log(err));
// static files
app.use(express.static(path.join(__dirname,'public')));


// starting the server
server.listen(app.get('port'),() => {
    console.log("Servidor en el puerto " + app.get('port') );
});