var request = require('request')
var constants = require('../constants')
var md5 = require('md5');
var Resources_RelationsMetadataTableClient = require('../dao/Resources_RelationsMetadataTableClient')
var AccountMetadataTableClient = require('../dao/AccountMetadataTableClient')

var resourceManager = {
    get_available_account_types: function(callback) {
        Resources_RelationsMetadataTableClient.get_resources_for_group(
            'Common',
            'ACCOUNT_TYPES',callback
        )
    },

    get_available_institutions_for_account_type: function(account_type,callback) {
        Resources_RelationsMetadataTableClient.get_resources_for_group(
            account_type,
            'INSTITUTIONS',callback
        )
    },

    add_resource: function(group,type,value,callback){
        Resources_RelationsMetadataTableClient.create_resources_for_group(group,type,value,callback)
    },


    create_account_id_resource_for_user: function(user_id,account_info,callback) {
        let accountType = account_info.accountType
        let accountNumber = account_info.accountNumber
        let institution = account_info.institution
        let accountName = account_info.accountName
        if (accountType == null || accountType == ''){callback('Account Type not provided',null);return}
        if (institution == null || institution == ''){callback('Institution not provided',null);return}
        if (accountNumber == null || accountNumber == ''){callback('Account Number not provided',null);return} 
        if (accountName == null || accountName == ''){callback('Account Name not provided',null);return}  
        if (user_id == null || user_id == ''){callback('User Id not provided',null); return} 
        resourceManager.get_available_account_types(function(error,data){
            if(error){callback('ConditionalCheckFailedException',null);return} 
                            //Assuming the only possible failure would be duplicate entry
            if (!accountType in data){callback('Invalid Account Type',null);return}
            resourceManager.get_available_institutions_for_account_type(accountType,function(error,data){
                if(error){callback(error,null);return}
                if(!accountType in data){callback('Invalid Institution',null);return}
                AccountMetadataTableClient.add_account(user_id,accountType,institution,
                                                        accountNumber,accountName,function(error,data){
                    if(error){callback(error,null);return}      
                    Resources_RelationsMetadataTableClient.create_resources_for_group(user_id,'ACCOUNT',data,callback)
                })
            })
        })
    }
}

module.exports = resourceManager