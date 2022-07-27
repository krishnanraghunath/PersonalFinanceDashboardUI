
const { v4: uuidv4 } = require('uuid');
var multer = require('multer')
var constants = require('../constants')
const fs = require('fs');
const s3 = require('../clients/s3_client')
var TransactionFilesUploadTableClient = require('../dao/TransactionFilesUploadTableClient')


const localStorage= multer.diskStorage(
    {destination:'/tmp/',
    filename:(req, file, cb) => {
    cb(null, uuidv4())
}})


var storageService = {
     
    localUpload: multer({
        storage:localStorage,
        fileFilter: (req, file, cb) => {
            if( constants.SUPPORTED_MIME_TYPES.includes(file.mimetype)){cb(null, true)}
            else {cb(null, false);}
        }
      }),

    s3Upload: function(user_id,req,callback) {
        let accountId = req.body.accountId
        if(accountId==null){callback('Account ID not provided',null);return}
        if(req.file==null){callback('Wrong file provided.',null);return}
        let fileName = req.file.filename
        let fileType = req.file.mimetype
        const fileContent = fs.readFileSync(req.file.path);
        s3.upload(constants.FILE_UPLOAD_BUCKET_NAME,fileName,fileContent,function(error,data){
            if(error){callback('Failed to Upload File',null);return}
            TransactionFilesUploadTableClient.add_upload_file(accountId,fileName,fileType,callback)
        })
    }

}


module.exports = storageService
