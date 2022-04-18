const express = require("express");
const app = express();
const path = require("path");
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const fs = require('fs');

const uuid = require('uuid');

var SocketIOFileUploadServer = require("socketio-file-upload");//1
const req = require("express/lib/request");

SocketIOFileUploadServer.listen(httpServer);//2

app
.use(SocketIOFileUploadServer.router) //2
.use(express.static(__dirname));

var usernames=[];
io.on("connection", (socket)=>{
    var uploader = new SocketIOFileUploadServer();
    uploader.listen(socket);
    
    uploader.dir = path.join (__dirname, "Uploads");
    console.log("new client connected");
    socket.emit("connected", "your are connected");
    socket.on("addme", name=>{
        usernames.push(name);
        socket.username = name;
        io.sockets.emit('updateusers', usernames);
    });
    socket.on("send", data=>{
        
        io.sockets.emit('message', data);
    });
    socket.on("disconnect", () => {
        var i= usernames.findIndex( u=> socket.username);
        usernames.splice(i, 1);
        io.sockets.emit('updateusers', usernames);
        console.log("disconnected");
   });
    uploader.on("saved", function(event){
        
        socket.broadcast.emit("uploaded", event.file.name)
    });
});
httpServer.listen(11111, () => {
    console.log("Server running at port:11111...");
});