var express = require("express");
var app = require("express")();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var message = require('./BusinessLogic/message');

app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/index.html",{"Content-Type": "text/html"});
});

http.listen(3031,()=>{
    console.log("Host is active on 3031");
    // message.sendEmail({});
});

app.use(express.static(__dirname));

io.on('connection',(socket)=>
{
    // socket.join('hello');
    // console.log(socket.rooms);
    console.log('a user is connected');
    socket.on('chat message',(mesg)=>
    {
        console.log('\n');
        console.log('Current users are :%o',io.rooms);
        // console.log('\n');
        message.post(mesg);
        socket.broadcast.emit("chat message",mesg);        
        // socket.broadcast.emit(mesg);
    });
    socket.on('raiseTicket',(mesg)=>{
        // socket.to('hello').emit('chat message','this is a system generated message');
        message.sendEmail(mesg);
    });
    // io.to('hello').emit('chat message','Welcome');
    //commit this new comment
})