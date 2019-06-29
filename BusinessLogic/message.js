var mongoose = require('mongoose');
var nodemailer= require('nodemailer');
mongoose.Promise = global.Promise;

var schema = mongoose.Schema({
    userID: Number,
    messageText : String,
    timeStamp : Date
});

var promise = mongoose.connect('mongodb://SamplePassword:Password123@ds016148.mlab.com:16148/chatdb');

var model = null;
promise.then((connectionObj)=>{
    if (connectionObj) 
    {
        model = connectionObj.model('Mesages',schema,'Mesages');
    }
    else{
        console.log('Connection failed');
    }
},(err)=>{
    console.log('Connection failed with error :'+err);
});

//Connecting account for nodemailer
var account = nodemailer.createTransport({
                service : 'outlook',
                host: 'smtp-mail.outlook.com',
                auth : 
                {
                    user : 'meshah@gep.com',
                    pass : 'P@55w0rd@123'    
                }
            });

module.exports = {
    post : (req)=>{
        let messageObj = {
            userID : req.userID,
            messageText : req.message,
            timeStamp : new Date().toDateString()
        };
        model.create(messageObj,(err,success)=>{
            if (err) 
            {
                console.log('Record Insert failed :'+err);
                return false;
            }
            return true;
        });
    },
    sendEmail : (mailObj)=>{
        account.sendMail({
            from : 'meshah@gep.com',
            to : 'shashank.yadav@gep.com',
            cc : mailObj.userInfo.UserBasicDetails.Email,
            subject : mailObj.subject,
            html : GenerateHTMLForChatHistory(mailObj)
        }).then((err)=>{
            if (err) {
                console.log('Email Sent/Failed with following information :'+JSON.stringify(err));
            }
        });
    }
}

function GenerateHTMLForChatHistory(mailObj) {
    var html = '<p>'+mailObj.description+'</p></br></br>';
    if (mailObj.chatHistory.length != 0) 
    {
        html += '<p>Chat History is as Follows: </p>'
        mailObj.chatHistory.forEach((element) => {
            if (element.isOtherUser) 
            {
                html += '<p><strong>Support Team</strong> : '+element.commentTxt+'</p>'
            }
            else
            {
                html += '<p><strong>'+mailObj.userInfo.UserBasicDetails.UserName+'</strong> : '+element.commentTxt+'</p>'
            }
        });
    }    
    return html;
}