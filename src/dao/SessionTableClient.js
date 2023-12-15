const constants = require("../constants");
ddb = require('../clients/ddb_client')

var SessionTableClient = {
    /*
    Adding New session
    session_id -> Uniq id created for session
    login_time -> creation_time
    expiry_time -> Expiration time (currently creation_time + default expiry)
     */
    add_session: function(user_name,auth_start,session_id,basicsecretId,callback) {
        var params = {
            TableName : 'UserSessionsTable',
            Item: {
                sessionId: session_id,
                basicSecretId: basicsecretId,
                user_id: user_name,
                session_start: auth_start,
                session_expiry: auth_start + constants.SESSION_EXPIRY_DEFAULT_TIME
            }
        }
        ddb.write(params,callback)
    },

    get_session: function(session_id,callback) {
        var params = {
            TableName : 'UserSessionsTable',
            KeyConditionExpression: "#id = :sessionId",
            ExpressionAttributeValues: {
                ':sessionId' : session_id
            },
            ExpressionAttributeNames: {
                '#id': 'sessionId'
            }
        }
        ddb.query(params,callback)
    }
}

module.exports = SessionTableClient
