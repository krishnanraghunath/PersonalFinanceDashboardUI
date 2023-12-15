import apiUtil  from "./apiUtil"
class tagUtils {
    DEFAULT_STATEMENTS = ['txnDescription','txnAmount','txnType','txnDestination']
    OPERATIONS = ['REGEX','OR','AND','GT','LT']
    STATEMENTS_OPERATION = ['OR','AND']
    constructor() {
        this.statements = {}
        this.tags = []
    }

    addTag(tag) {
        let tagId = tag.id 
        this.statements[tagId] = {...tag}
        if(this.tags.includes(tagId) == false){
            this.tags.push(tagId)
            return true
        }
        return false
    }

    clear() {
        this.statements = {}
        this.tags = []
    }

    getTagRules(){
        let tagChilderCount = {}
        this.tags.forEach(tag =>{
            let tagItem = this.statements[tag]
            tagChilderCount[tag] = tagChilderCount[tag]==null?0:tagChilderCount[tag]
            if(this.tags.includes(tagItem.lOperand))
                tagChilderCount[tagItem.lOperand] =  
                            tagChilderCount[tagItem.lOperand]==null?
                            1:tagChilderCount[tagItem.lOperand] + 1
            if(this.tags.includes(tagItem.rOperand))
            tagChilderCount[tagItem.rOperand] =  
                    tagChilderCount[tagItem.rOperand]==null?
                    1:tagChilderCount[tagItem.rOperand] + 1
        })
        //There should be one and only one , i.e the root node with zero childrend (i.e no other statement are using the said statement)
       let rootTags = this.tags.filter(tag => tagChilderCount[tag] == 0)
       if(rootTags.length != 1)return null
       else{
           let rootTag = this.statements[rootTags[0]]
           this.removeTag(rootTag)
           rootTag.id = 'root'
           this.addTag(rootTag)
       }
       let tagRules = {}
       this.tags.forEach(tag => {
        tagRules[tag] = this.statements[tag]
       })
       return tagRules
       //Now create tag Rules and return
    //    return tagRules
    }


    getUpstreamDependencies(tag) {
        let dependencies = []
        let tagId = tag.id
        this.tags.forEach(tag => {

            let lTag = this.statements[tag].lOperand
            let rTag = this.statements[tag].rOperand
            if(lTag == tagId || rTag == tagId )
                dependencies.push(tag)
        })
        return dependencies
    }

    removeTag(tag) {
        let tagId = tag.id 
        this.tags = this.tags.filter(tag => tag!=tagId)
    }

    getTags(){
        return this.tags.map(tagId => this.statements[tagId])
    }

    getStatements(){
        return this.DEFAULT_STATEMENTS.concat(this.tags)
    }

    getTagStatement(tagId){
        if(this.tags.includes(tagId)){
            return this.statements[tagId]
        }
        return null
    }

    getUserTags(reference,callback){
        let user_tags=apiUtil.callApi('get_user_tags',{})
        user_tags.then((user_tags) => {
            if('error' in user_tags){callback(reference,user_tags.error,null);return}
            callback(reference,null,user_tags.data)
        })
        .catch(function(error){callback(reference,error,null)})
    }


    getUserTagForTagId(reference,tagId,callback){
        let tag_data=apiUtil.callApi('get_tag_info_by_id',{tagName:tagId})
        tag_data.then((tag_data) => {
            if('error' in tag_data){callback(reference,tag_data.error,null);return}
            callback(reference,null,tag_data.data)
        })
        .catch(function(error){callback(reference,error,null)})
    }


    getAttachedAccountsForTagId(reference,tagId,callback){
        let tag_data=apiUtil.callApi('get_attached_accounts_for_tag',{tagName:tagId})
        tag_data.then((tag_data) => {
            if('error' in tag_data){callback(reference,tag_data.error,null);return}
            callback(reference,null,tag_data.data)
        })
        .catch(function(error){callback(reference,error,null)})
    }

    deleteTagForTagId(reference,tagId,callback){
        let tagDelete = apiUtil.callApi('delete_tag',{tagName:tagId})
        tagDelete.then((tagDelete) => {
            if('error' in tagDelete){callback(reference,tagDelete.error,null);return}
            callback(reference,null,tagDelete.data)
        })
        .catch(function(error){callback(reference,error,null)})
    }

    attachAccountsForTagId(reference,tagId,accounts,callback){
        let tagUpdate = apiUtil.callApi('update_tag',{tagName:tagId,accounts:accounts})
        tagUpdate.then((tagUpdate) => {
            if('error' in tagUpdate){callback(reference,tagUpdate.error,null);return}
            callback(reference,null,tagUpdate.data)
        })
        .catch(function(error){callback(reference,error,null)})
    }
}

export default tagUtils;