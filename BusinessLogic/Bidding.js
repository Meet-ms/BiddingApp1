var mongoose = require('mongoose');
var azureSearch = require('azure-search');
var uuid = require('uuid/v1')
var azureSearchclient = azureSearch({
  url: "https://bidding.search.windows.net",
  key: "7060EA088BE1235D54E84A666EBA96D1",
  //version: "2016-09-01", // optional, can be used to enable preview apis
//   headers: { // optional, for example to enable searchId in telemetry in logs
//     "x-ms-azs-return-searchid": "true",
//     "Access-Control-Expose-Headers": "x-ms-azs-searchid"
//   }
});
mongoose.Promise = global.Promise;

var schema = mongoose.Schema({
    userID: Number,
    messageText : String,
    timeStamp : Date
});

var promise = mongoose.connect('mongodb://SamplePassword:Password123@ds016148.mlab.com:16148/chatdb');

var searchSchema = {
    name: 'BiddingIndex',
    fields:
     [ { name: 'ProductId',
         type: 'Edm.Int32',
         searchable: false,
         filterable: true,
         retrievable: true,
         sortable: true,
         facetable: true,
         key: true },
       { name: 'UserId',
         type: 'Edm.Int32',
         searchable: true,
         filterable: false,
         retrievable: true,
         sortable: false,
         facetable: false,
         key: false 
        },
        { name: 'BidPrice',
         type: 'Edm.Double',
         searchable: false,
         filterable: false,
         retrievable: true,
         sortable: false,
         facetable: false,
         key: false 
        },
        { name: 'DateCreated',
         type: 'Edm.DateTimeOffset',
         searchable: false,
         filterable: false,
         retrievable: true,
         sortable: false,
         facetable: false,
         key: false 
        }
    ],
    scoringProfiles: [],
    defaultScoringProfile: null,
    corsOptions: null };

//Create Index
// azureSearchclient.createIndex(searchSchema,(err, success)=>{
//     if (err) {
//         console.log("Error occured while creating index: "+ err);
//     }
//     else
//     {
//         console.log("Index Created");
//     }

// });

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


module.exports = {
    post : (req)=>{
        let BiddingObj = {
            id: uuid(),
            ProductId : req.ProductId,
            UserId : req.UserId,
            BidValue : req.BidValue,
            dateCreated : new Date().toJSON()
        };
        // model.create(messageObj,(err,success)=>{
        //     if (err) 
        //     {
        //         console.log('Record Insert failed :'+err);
        //         return false;
        //     }
        //     return true;
        // });
        azureSearchclient.addDocuments('biddingindex', [BiddingObj], function(err, results){
            if (err) {
                console.log('Failed to add document: '+err);
            }
            else
            {
                console.log('Document Added')
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