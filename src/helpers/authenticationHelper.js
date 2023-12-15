var request = require('request')
var constants = require('../constants')
var md5 = require('md5');
var sessionTableClient = require('../dao/SessionTableClient')

var authenticationHelper = {
    get_token_from_code: function(authentication_code,callback) {
        let tokenBody = constants.CODE_TOKEN_EXCHANGE_BODY
        tokenBody.code = authentication_code
        request.post({
                headers : constants.CODE_TOKEN_EXCHANGE_HEADERS,
                url : constants.AUTH_ENDPOINT + constants.TOKEN_ENDPOINT,
                form : tokenBody},
            function(error, response, body) {
                    if(error){callback(body,null);return}
                    body = JSON.parse(body)
                    if ('error' in body){callback(body['error'],null);return}
                    callback(null,body)
            })
    },

    authenticate: function(request,callback) {
        // callback(null,'48ddf8a2-6124-4c6a-9078-65aa54bc9a1a')
        var sessionId = request.cookies._SESSION
        if (sessionId == null) {callback('Not Authenticated',null);return}
        sessionTableClient.get_session(sessionId,function(error,data){
            if(error){callback(error,null);return}
            let basic_secret_id = md5(request.socket.remoteAddress + request.headers['user-agent'])
            if (Math.floor(Date.now()/1000) > data.Items[0]['session_expiry'] ||
                basic_secret_id != data.Items[0]['basicSecretId']
                        ){callback('ExpiredOrInvalidSessionToken',null);return}
            callback(null,data.Items[0]['user_id'])
        })
    },

    add_new_session(req,token_body,callback) {
        /* We are just getting user id and start time , from the many types of tokens we have*/
        //TODO: Explore more on what we can use from these tokens data
        let token_data =  JSON.parse(Buffer.from(token_body.access_token.split('.')[1], 'base64')
                                            .toString('ascii'))
        //Just getting md5 of token and making it as session id. It would be enough for now
        let sessionId = md5(token_body.access_token)
        let basic_secret_id = md5(req.socket.remoteAddress + req.headers['user-agent'])
        sessionTableClient.add_session(token_data.username,token_data.auth_time,sessionId,basic_secret_id,function(error,data){
            if(error){callback(error,null);return}
            callback(null,sessionId)
        })
    }
}

module.exports = authenticationHelper