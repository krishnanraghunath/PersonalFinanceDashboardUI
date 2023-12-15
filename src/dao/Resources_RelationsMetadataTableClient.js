var md5 = require('md5');
ddb = require('../clients/ddb_client')
var Resources_RelationsMetadataTableClient = {
    /*
    Fetch a resource
     */
    get_resources_for_group: function(resource_group,resource_type,callback) {
        var params = {
            TableName : 'Resources_RelationsMetadataTable',
            IndexName : 'ResourceGroup-ResourceType-index',
            KeyConditionExpression: 'ResourceGroup = :groupId  and ResourceType = :typeId',
            ExpressionAttributeValues: {
                    ':groupId': resource_group,
                    ':typeId' : resource_type
            } 
        }
        ddb.query(params,function(error,data){
            if(error){
                if(error){callback(null,[]);return}
                else{callback(error,null);return}
            }
            callback(null,data.Items.map(item => item.ResourceValue))
        })
    },

    create_resources_for_group: function(resource_group,resource_type,resource_val,callback) {
        var params = {
            TableName : 'Resources_RelationsMetadataTable',
            Item: {
                ResourceGroup:resource_group,
                ResourceType:resource_type,
                ResourceValue:resource_val,
                resourceId: md5(resource_group+resource_type+resource_val)
            }
        }
        ddb.write(params,callback)
    },


}

module.exports = Resources_RelationsMetadataTableClient
