var request = require('request')
var constants = require('../constants')
var md5 = require('md5');
var Resources_RelationsMetadataTableClient = require('../dao/Resources_RelationsMetadataTableClient')
var AccountMetadataTableClient = require('../dao/AccountMetadataTableClient')
var TagMetadataTableClient = require('../dao/TagMetadataTableClient');

var resourceManager = {



    get_available_account_types: function(callback) {
        Resources_RelationsMetadataTableClient.get_resources_for_group(
            'Common',
            'ACCOUNT_TYPE',callback
        )
    },

    get_available_institutions_for_account_type: function(account_type,callback) {
        Resources_RelationsMetadataTableClient.get_resources_for_group(
            account_type,
            'INSTITUTION',callback
        )
    },


    //TODO: As of now tagName can not be changed --> Seems okay, we can have a display name later
    get_attached_accounts_for_tag: function(user_id,tagName,callback) {
        let tagId = md5(user_id + tagName)
        Resources_RelationsMetadataTableClient.get_resources_for_group(
            tagId,
            'ATTACHED_ACCOUNT',callback
        )
    },

    add_resource: function(group,type,value,callback){
        Resources_RelationsMetadataTableClient.create_resources_for_group(group,type,value,callback)
    },


    get_accounts_for_user: function(user_id,callback) {
        AccountMetadataTableClient.get_accounts_for_user(user_id,function(error,data) {
            let accounts = []
            if(error){
                if(error){callback(null,[]);return}
                else{callback(error,null);return}
            }
            data.Items.forEach((item) =>{
                item.accountNumber = "***"+ item.accountNumber.slice(Math.max(item.accountNumber.length-4,1))
                //19800 -> 5.5 Hours --> Second (GMT -> IST). As of now doing it at server end.
                //TODO: The time stamp to string can be done at client end later.
                item.creationTime = new Date((item.creationTime+19800)*1000).toISOString().replace(/T/,' ').replace(/\..+/, '')
                item.lastModifiedTime = new Date((item.lastModifiedTime+19800)*1000).toISOString().replace(/T/,' ').replace(/\..+/, '')
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
        let modify = tag_info.modify
        if(tagName == null || tagName == ''){callback('Tag Name is not provided',null);return}
        if(tagRules == null || typeof(tagRules) != 'object'){callback('Tag Rules is not provided',null);return}
        if(modify) TagMetadataTableClient.modify_tag(user_id,tagName,tagRules,callback)
        else TagMetadataTableClient.create_tag(user_id,tagName,tagRules,callback)
    },

    delete_tag_for_user: function(user_id,tag_info,callback) {
        let tagName = tag_info.tagName
        let tagId = md5(user_id+tagName)
        TagMetadataTableClient.delete_tag(tagId,callback)
    },


    

    get_tags_for_user: function(user_id,callback){
        TagMetadataTableClient.get_tags_for_user(user_id,function(error,data){
            if(error){
                if(error == 'No Items'){callback(null,[]);return}
                else{callback(error,null);return}
            }
            callback(null,data.Items)
        })
    },

    //TODO: Here we may have to change the tagName in future. So we should start considering passing tagId instead of tagName
    //And then verify if the tagId belongs to the user
    get_tag_by_tag_name: function(user_id,tagName,callback){
        let tagId = md5(user_id+tagName)
        TagMetadataTableClient.get_tag_by_tagId(tagId,function(error,data){
            if(error){callback(error,null);return}
            else{callback(null,data.Items[0])}
        }) 
    },


    // //TODO: We need to check if passed accountIds belong to customer only 
    // set_attached_accounts_for_tag: function(user_id,tagName,accountIds,callback) {
    //     let tagId = md5(user_id + tagName)
    //     let accounts = ""
    //     Resources_RelationsMetadataTableClient.get_resources_for_group(
    //         user_id,
    //         'ACCOUNTS',function(error,userAccounts){
    //             if(error){callback(error,null);return}
    //             accountIds.forEach(accountId =>{

    //             })
    //         }
    //     )
    // },
}

module.exports = resourceManager