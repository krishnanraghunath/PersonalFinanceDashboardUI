var request = require('request')
var constants = require('../constants')
var AWS = require('aws-sdk');  
var lambda = new AWS.Lambda(); 

/*
We would be calling the back end lambda desribed in the environment variable BACKEND_LAMBDA_URL
as of now we are just calling the function 
*/
var apiHelper = {

    /*
    / Currently we will be directly calling the backend lambda. Later would be shifting to more approprate setup 
    */
    call_api: function(req,callback) {
        /*An event map with following attributes will be used to call the lambda
        {
            user_id => user id associated with the authenticated request.
            api => api to be called
            query => query params
            body => body params
        }
        */
        let apiUrls = req.url.split('?')[0].split('/') //Removing the ?* at the end of path 
        let params = {}
        if(req.method == 'GET'){params = req.query}
        if(req.method == 'POST'){params = JSON.parse(req.body)}
        let lambdaEvent = {
            user_id: req.user_id, //user_id to be set on request 
            api: apiUrls[apiUrls.length-1],
            params:params
         }
        console.log("Invoking backend lambda with payload =>" + JSON.stringify(lambdaEvent))
        lambda.invoke({
            FunctionName: constants.BACKEND_API_URL,
            Payload:JSON.stringify(lambdaEvent),
        },function(error,data){
            if(error){callback(error,null);return}
            data = JSON.parse(data['Payload'])
            callback(null,data)
        })
    }
}

module.exports = apiHelper