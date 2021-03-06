var express = require("express");
var app = require("express")();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var message = require('./BusinessLogic/Bidding');
var uuid = require('uuid');

app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/index.html",{"Content-Type": "text/html"});
});

http.listen(3033,()=>{
    console.log("Host is active on 3031");
    // message.sendEmail({});
});

app.use(express.static(__dirname));

io.on('connection',(socket)=>
{
    // socket.join('hello');
    // console.log(socket.rooms);
    console.log('a user is connected');    
    socket.join('bidding',()=>{});
    let rooms = Object.keys(socket.rooms);
    console.log(rooms);
    socket.emit("UserId", uuid());
    socket.on('Bidding Starts',(mesg)=>
    {
        console.log('\n');
        console.log('Current users are :%o',io.rooms);
        // console.log('\n');
        var data = message.post(mesg, io);
        // socket.emit("Azure Data",data);        
        // socket.broadcast.emit(mesg);
    });
    socket.on('close',(req)=>{
        // socket.to('hello').emit('chat message','this is a system generated message');
        message.dumpData(req);
    });
    // io.to('hello').emit('chat message','Welcome');
    //commit this new comment
})