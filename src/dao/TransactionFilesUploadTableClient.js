
const constants = require("../constants");
ddb = require('../clients/ddb_client')

var TransactionFilesUploadTableClient = {

    add_upload_file: function(id,fileName,fileType,callback) {
        var params = {
            TableName : 'TransactionFilesUploadTable',
            Item: {
                targetId: id,
                fileId: fileName,
                fileType: fileType,
                Timestamp: Math.floor(Date.now()/1000),
                LastModifiedTimestamp: Math.floor(Date.now()/1000),
                status: 'UPLOADED'
            }
        }
        ddb.write(params,callback)
    },
}

module.exports = TransactionFilesUploadTableClient
