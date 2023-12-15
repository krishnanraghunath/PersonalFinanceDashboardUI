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


    modify_tag: function(user_name,tagName,tagRules,callback){
        let tagId = md5(user_name+tagName)
        var params = {
            TableName : 'TagMetadataTable',
            Key:{
                'tagId':tagId
            },
            UpdateExpression: "set #tagRules = :tagRules,#lastModifiedTime = :lastModifiedTime",
            ExpressionAttributeValues: {
                ':tagRules' : tagRules,
                ':lastModifiedTime':Math.floor(Date.now()/1000),
            },
            ExpressionAttributeNames: {
                '#tagRules': 'tagRules',
                '#lastModifiedTime':'lastModifiedTime'
            }
        }
        ddb.update(params,callback)
    },


    //TODO: user id shold be verified before deleting. Now we create tagId from provided tagName and user.
    //Needs to change those behaviour later.
    delete_tag: function(tagId,callback){
        var params = {
            TableName : 'TagMetadataTable',
            Key:{
                'tagId':tagId
            },
            UpdateExpression: "set #status = :status,#lastModifiedTime = :lastModifiedTime",
            ExpressionAttributeValues: {
                ':status' : 'DELETED',
                ':lastModifiedTime':Math.floor(Date.now()/1000),
            },
            ExpressionAttributeNames: {
                '#status': 'status',
                '#lastModifiedTime':'lastModifiedTime',
            }
        }
        ddb.update(params,callback)

    },

    get_tags_for_user: function(user_id,callback){
        var params = {
            TableName : 'TagMetadataTable',
            IndexName : 'user_id-status-index',
            KeyConditionExpression: "#id = :user_id and #status = :status",
            ExpressionAttributeValues: {
                ':user_id' : user_id,
                ':status' : 'ACTIVE'  //Only active accounts will be fetched
            },
            ExpressionAttributeNames: {
                '#id': 'user_id',
                '#status': 'status'
            },
            ProjectionExpression:"tagId,tagName"
        }
        ddb.query(params,callback)
    },

    //TODO: tagId is calculated at server end now, so user id check is not needed for now
    get_tag_by_tagId: function(tagId,callback) {
        var params = {
            TableName : 'TagMetadataTable',
            KeyConditionExpression: "#id = :tagId",
            ExpressionAttributeValues: {
                ':tagId' : tagId
            },
            ExpressionAttributeNames: {
                '#id': 'tagId'
            },
            ProjectionExpression:"tagName,tagRules"
        }
        ddb.query(params,callback)
    },

    verify_tagRules: function(tagRules) {
        return true
    }

}

module.exports = TagMetadataTableClient
