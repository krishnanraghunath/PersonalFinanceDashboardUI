ddb = require('../clients/ddb_client')
var md5 = require('md5');

var AccountMetadataTableClient = {
    /*
    Adding New session
    session_id -> Uniq id created for session
    login_time -> creation_time
    expiry_time -> Expiration time (currently creation_time + default expiry)
     */
    add_account: function(user_name,account_type,institution_type,account_number,account_name,callback) {
        let accountId = md5(account_type + institution_type + account_number)
        var params = {
            TableName : 'AccountMetadataTable',
            Item: {
                user_id: user_name,
                accountId: accountId,
                accountName: account_name,
                accountType: account_type,
                accountNumber: account_number,
                institution: institution_type,
                status: 'ACTIVE',
                creationTime: Math.floor(Date.now()/1000),
                lastModifiedTime: Math.floor(Date.now()/1000)
            },
            ConditionExpression: "#id <> :accountId",
            ExpressionAttributeNames: { 
                "#id" : "accountId" 
            },
            ExpressionAttributeValues: {
                ":accountId" : accountId
            }
        }
        ddb.write(params,function(error,data){
            if(error){callback(error,null);return} 
            callback(null,accountId)
        })
    },

    get_accounts_for_user: function(user_id,callback) {
        var params = {
            TableName : 'AccountMetadataTable',
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
            ProjectionExpression:"accountId,accountType,accountName,institution,accountNumber,creationTime,lastModifiedTime"
        }
        ddb.query(params,callback)
    },

    get_account_for_accountId: function(accountId,callback){
        var params = {
            TableName : 'AccountMetadataTable',
            KeyConditionExpression: "#id = :accountId",
            ExpressionAttributeValues: {
                ':accountId' : accountId
            },
            ExpressionAttributeNames: {
                '#id': 'accountId'
            }
        }
        ddb.query(params,callback)
    },

    delete_account: function(userId,accountId,callback){
        var params = {
            TableName : 'AccountMetadataTable',
            Key:{
                'accountId':accountId
            },
            UpdateExpression: "set #status = :status,#lastModifiedTime = :lastModifiedTime",
            ConditionExpression: "#user_id = :user_id",
            ExpressionAttributeValues: {
                ':status' : 'DELETED',
                ':lastModifiedTime':Math.floor(Date.now()/1000),
                ':user_id' : userId
            },
            ExpressionAttributeNames: {
                '#status': 'status',
                '#lastModifiedTime':'lastModifiedTime',
                '#user_id':'user_id'
            }
        }
        ddb.update(params,callback)
    }

}

module.exports = AccountMetadataTableClient
