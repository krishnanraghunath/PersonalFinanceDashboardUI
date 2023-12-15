const AWS = require('aws-sdk')
AWS.config.update({region: 'ap-south-1'}); // For local testing
const s3Client = new AWS.S3();
var s3 = {
    upload: function(bucket,key,filedata,callback){
        const params = {
            Bucket: bucket,
            Key: key, 
            Body: filedata
        };
        s3Client.upload(params,callback) 
    }
}

module.exports = s3