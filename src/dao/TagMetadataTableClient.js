const constants = require("../constants");
ddb = require('../clients/ddb_client')
var md5 = require('md5');

var TagMetadataTableClient = {

    create_tag: function(user_name,tagName,tagRules,callback) {
        let tagId = md5(user_name+tagName)
        if(TagMetadataTableClient.verify_tagRules(tagRules) == false){
                callback('TagRule Verification Error',null);return}
        var params = {
            TableName : 'TagMetadataTable',
            Item: {
                user_id: user_name,
                tagId: tagId,
                tagName: tagName,
                tagRules: tagRules,
                status: 'ACTIVE',
                creationTime: Math.floor(Date.now()/1000),
                lastModifiedTime: Math.floor(Date.now()/1000)
            },
            ConditionExpression: "#id <> :tagId",
            ExpressionAttributeNames: { 
                "#id" : "tagId" 
            },
            ExpressionAttributeValues: {
                ":tagId" : tagId
            }
        }
        ddb.write(params,function(error,data){
            if(error){callback(error,null);return} 
            callback(null,tagId)
        })
    },


    verify_tagRules: function(tagRules) {
        return true
    }

}

module.exports = TagMetadataTableClient
