var AWS = require('aws-sdk')
var constants = require('../constants')
var docClient = new AWS.DynamoDB.DocumentClient();
var ddb = {
    query: function(params,callback){
        docClient.query(params,function(error,data){
            if(error){callback(error,null);return}
            if(data.Count == 0){callback('No Items',null);return}
            callback(null,data)
        })
    },
    
    write: function(params,callback){
        docClient.put(params,function(error,data){
            if(error){callback(error,null);return}
            callback(null,data)
        })
    }
}

module.exports = ddb