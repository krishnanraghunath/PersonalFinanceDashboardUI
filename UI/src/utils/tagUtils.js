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

    getTagRules(){
        let tagChilderCount = {}
        let tagRules = {}
        this.tags.forEach(tag =>{
            let tagItem = this.statements[tag]
            tagRules[tag] = tagItem.lOperand+'%%'+tagItem.operation+'%%'+tagItem.rOperand
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
           tagRules['root'] = tagRules[rootTags[0]]
           delete  tagRules[rootTags[0]]
       }
       //Now create tag Rules and return
       return tagRules
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
}

export default tagUtils;