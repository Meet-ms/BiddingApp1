var mongoose = require('mongoose');
var ajax = require('ajax-request');
var azureSearch = require('azure-search');
var uuid = require('uuid/v1');

var azureSearchclient = azureSearch({
  url: "https://bidding.search.windows.net",
  key: "7060EA088BE1235D54E84A666EBA96D1"
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

var headers = {
    'api-key':       '7060EA088BE1235D54E84A666EBA96D1',
    'Content-Type':     'application/json'
};

module.exports = {
    post : (req)=>{
        let BiddingObj = {
            id: uuid(),
            ProductId : req.ProductId,
            UserId : req.UserId,
            BidValue : req.BidValue,
            dateCreated : new Date().toJSON()
        };
        azureSearchclient.addDocuments('biddingindex', [BiddingObj], function(err, results){
            if (err) {
                console.log('Failed to add document: '+JSON.stringify(err));
            }
            else
            {
                console.log('Document Added');
                // search the index (note that multiple arguments can be passed as an array)
                ajax.download({
                    url: "https://bidding.search.windows.net/indexes/biddingindex/docs?search=*&$top=5&$orderby=BidValue desc&api-version=2019-05-06",
                    method: 'GET'
                },function (err, data){
                    return data;
                }
                )
            }
        });
    }
}