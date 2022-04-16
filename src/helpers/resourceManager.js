var request = require('request')
var constants = require('../constants')
var md5 = require('md5');
var Resources_RelationsMetadataTableClient = require('../dao/Resources_RelationsMetadataTableClient')
var AccountMetadataTableClient = require('../dao/AccountMetadataTableClient')
var TagMetadataTableClient = require('../dao/TagMetadataTableClient');
const { default: commonUtils } = require('../../UI/src/utils/commonUtils');

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


    get_accounts_for_user: function(user_id,callback) {
        AccountMetadataTableClient.get_accounts_for_user(user_id,function(error,data) {
            if(error){callback(error,null)}
            let accounts = []
            data.Items.forEach((item) =>{
                item.accountNumber = "***"+ item.accountNumber.slice(Math.max(item.accountNumber.length-4,1))
                item.creationTime = new Date(item.creationTime*1000).toISOString().replace(/T/,' ').replace(/\..+/, '')
                item.lastModifiedTime = new Date(item.lastModifiedTime*1000).toISOString().replace(/T/,' ').replace(/\..+/, '')
                accounts.push(item)
            })
            callback(null,accounts)
        })
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
    },


    delete_account_for_user: function(user_id,account_id,callback) {
        AccountMetadataTableClient.delete_account(user_id,account_id,callback)
    },

    add_tag_for_user: function(user_id,tag_info,callback) {
        let tagName = tag_info.tagName
        let tagRules = tag_info.tagRules
        if(tagName == null || tagName == ''){callback('Tag Name is not provided',null);return}
        if(tagRules == null || typeof(tagRules) != 'object'){callback('Tag Rules is not provided',null);return}
        TagMetadataTableClient.create_tag(user_id,tagName,tagRules,callback)
    }
}

module.exports = resourceManager