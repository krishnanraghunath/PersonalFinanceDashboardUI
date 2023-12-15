import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import apiUtil from '../../utils/apiUtil'
import configData from '../../config.json'
import {Box,Grid,FormControl,TextField,Button,Chip,Divider,Alert} from '@mui/material'
import { LoadingButton } from '@mui/lab';
import commonUtils from '../../utils/commonUtils'
import tagUtils from '../../utils/tagUtils'
import stateUtil from '../../utils/stateUtil'
import Autocomplete from '@mui/material/Autocomplete';
import { thTH } from "@mui/material/locale";


class TagModify extends React.Component {
    
    constructor(props) {
        super(props);
        this.tagUtil  = new tagUtils();
        this.data = {
            accounts:[],
            accountsAttached:[],
            tagName:'',
            ColumnDefenition:configData.TABLE_COLUMN_DEFENITIONS.ACCOUNT_DETAILS
        }
        this.state = {
            tag_search:{loading:false,disabled:true},
            tag_value:{ disabled:false,error:false},
            user_tags_data :[],
            attached_accounts:[],
            non_attached_accounts:[],
            accountId_attach:'',
            accountId_detach:'',
            tagFoundStatus:0,
            tagActionError:false,
            deleteButton:{loading:false,disabled:false},
            updateButton:{loading:false,disabled:false},
        }

        this.autoComplete = this.autoComplete.bind(this)
        this.onSearchTag = this.onSearchTag.bind(this)
        this.reset = this.reset.bind(this)
        this.detach = this.detach.bind(this)
        this.attach = this.attach.bind(this)
        this.attachCellClick = this.attachCellClick.bind(this)
        this.detachCellClick = this.detachCellClick.bind(this)
        this.updateTag = this.updateTag.bind(this)
        this.deleteTag = this.deleteTag.bind(this)
    }

    attach()  {
        this.data.accountsAttached.push(this.state.accountId_attach)
        this._sync_table_rows()
        this.setState({accountId_attach:''})
    }

    detach() {
        this.data.accountsAttached = this.data.accountsAttached.filter(item => item != this.state.accountId_detach)
        this._sync_table_rows()
        this.setState({accountId_detach:''})
    }

   


    attachCellClick(params,event) {
        let ctrl = event.ctrlKey
        let id = params.id
        if(id != this.state.accountId_attach) {this.setState({accountId_attach:params.id})}
        if(id == this.state.accountId_attach && ctrl) {this.setState({accountId_attach:''})}
    }
    detachCellClick(params,event) {
        let ctrl = event.ctrlKey
        let id = params.id
        if(id != this.state.accountId_detach) {this.setState({accountId_detach:params.id})}
        if(id == this.state.accountId_detach && ctrl) {this.setState({accountId_detach:''})}
    }

    componentDidMount() {
        stateUtil.disable(this,'tag_value')
        apiUtil.callAsync('get_accounts',{})
        .then((items) => {
            this.data.accounts = items.data
            this.tagUtil.getUserTags(this,function(reference,error,data){
                if(error){}
                else{reference.setState({user_tags_data:data})}
                stateUtil.enable(reference,'tag_value')
            })
        
        })
        .catch( function(error){
            console.log(error)
        })
    }


    _sync_table_rows(){
        let attachedAccounts = []
        let nonAttachedAccounts = []
        this.data.accounts.forEach(account =>{
            let accountId = account.accountId 
            if(this.data.accountsAttached.includes(accountId)){attachedAccounts.push(account)}
            else {nonAttachedAccounts.push(account)}
        })
        this.setState({attached_accounts:attachedAccounts,non_attached_accounts:nonAttachedAccounts})
    }

    onSearchTag(){
        this.data.attachedAccounts = []
        this.setState({tagFoundStatus:0})
        stateUtil.setState(this,'TAG_CREATE','TAG_SEARCHING')
        this.tagUtil.getAttachedAccountsForTagId(this,this.state.tagName,function(reference,error,accountsAttached){
                //TODO: Add error
                if(error){stateUtil.setState(reference,'TAG_CREATE','TAG_SEARCH_NOT_FOUND');return} 
                reference.data.accountsAttached = accountsAttached
                reference._sync_table_rows()
                stateUtil.setState(reference,'TAG_CREATE','TAG_SEARCH_FOUND')
        })
    }

    reset() {
        this.data.attachedAccounts = []
        stateUtil.setState(this,'TAG_CREATE','INITIAL_STATE')
    }

    updateTag() {
        stateUtil.setState(this,"TAG_CREATE","TAG_MODIFY")
        this.tagUtil.attachAccountsForTagId(this,this.state.tagName,this.data.accountsAttached,
                            function(reference,error,data){
            //TODO: Add error
            if(error){stateUtil.setState(reference,'TAG_CREATE','TAG_ACTION_COMPLETE');return} 
            reference.data.accountsAttached = []
            stateUtil.setState(reference,'TAG_CREATE','INITIAL_STATE')
    })
    }

    deleteTag() {
        stateUtil.setState(this,"TAG_CREATE","TAG_DELETE")
        this.tagUtil.deleteTagForTagId(this,this.state.tagName,function(reference,error,data){
            console.log(error)
            console.log(data)
            //Reset everything and show the error if unsuccesfull
            if(error){
                stateUtil.setState(reference,'TAG_CREATE','TAG_ACTION_COMPLETE',{tagActionError:true})
            }
            else{
                //Remove the tag from tag list
                let currentTagData = reference.state.user_tags_data
                currentTagData = currentTagData.filter(item => item.tagName!=reference.state.tagName)
                stateUtil.setState(reference,'TAG_CREATE','INITIAL_STATE',{user_tags_data:currentTagData})
            }  
        })
    }

    autoComplete(event,value,reason) {
        if (value == null)this.data.tagName = ''
        else this.data.tagName = value.trim()
        if(this.data.tagName.length > 5){stateUtil.enable(this,'tag_search',{tagName:this.data.tagName})}
        else {stateUtil.disable(this,'tag_search')}
    }

    render() {
        return<div>
        <Grid container sx={{border:2}}>
            <Grid item>
                <FormControl sx={{ m: 2, minWidth: 300,color:"red",backgroundColor:"white"}}> 
                <Autocomplete
                        autoHighlight
                        options={this.state.user_tags_data.map((tag) => tag.tagName)}
                        renderInput={(params) => <TextField {...params}/>}
                        onChange={this.autoComplete}
                        disabled={this.state.tag_value.disabled}
                    />
                </FormControl>
            </Grid>
            <Grid item>
                <Box sx={{width:"100%",m:2}}>
                        <LoadingButton  loading={this.state.tag_search.loading} disabled={this.state.tag_search.disabled} loadingIndicator="Searching..." 
                            variant="contained"  sx={{margin:1,border:2}} onClick={this.onSearchTag}>Search Tag</LoadingButton>   
                
                {this.state.tagFoundStatus > 0 && 
                        <Button variant="contained" color="error" onClick={this.reset}>Reset</Button>
                }  
                 </Box>         
            </Grid>
        </Grid>
        {this.state.tagActionError &&
        <Alert severity="error" onClose={() => {this.setState({tagActionError:false})}} color="error">Error occured while deleting/updating the Tag.</Alert>}
        {this.state.tagFoundStatus == 2 && 
            <Box sx={{width:"100%",m:1}}>
                <LoadingButton  loading={this.state.updateButton.loading} disabled={this.state.updateButton.disabled} loadingIndicator="Updating..." 
                    variant="contained"  sx={{m:1}} onClick={this.updateTag}>Update Tag</LoadingButton>  
                <LoadingButton  loading={this.state.deleteButton.loading} disabled={this.state.deleteButton.disabled} loadingIndicator="Deleting..." 
                    variant="contained" color ="error" onClick={this.deleteTag}>Delete Tag</LoadingButton>  
            </Box>   
            }   
        {this.state.tagFoundStatus == 2 &&  
        <Grid container>
            <Grid item sx={{width:"100%"}}>
            <Divider/><Divider/> <Divider/> <Divider/>
            <Divider color="error"/>  <Divider color="error"/>
            <Divider color="error"/>  <Divider color="error"/>
                <Chip sx={{m:2}} label={"Accounts not attached/not to be attached to Tag : " + this.state.tagName} color="error" variant="outlined" />
                <Box sx={{width:"100%"}}>
                    <DataGrid autoHeight
                        rows={this.state.non_attached_accounts}
                        columns={this.data.ColumnDefenition}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        onCellClick={this.attachCellClick}
                        sx={{
                            boxShadow: 2,
                            border: 2,
                            margin : 2,
                            borderColor: 'primary.light',
                            '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                            },
                        }}
                        getRowId={(row) => row.accountId} 
                    />
                </Box>
                {this.state.accountId_attach.length > 1 &&
                <Box sx={{width:"100%",m:2}}>
                <Button variant="contained" color="error" sx={{margin:1,border:2}} onClick={this.attach}>Attach</Button>
                </Box>}
            </Grid>
            <Grid item sx={{width:"100%"}}>
            <Divider/> <Divider/> <Divider/> <Divider/>
            <Divider color="info"/>  <Divider color="info"/>
            <Divider color="info"/>  <Divider color="info"/>
            <Chip  sx={{m:2}}label={"Accounts Already attached/to be attached to Tag : " + this.state.tagName} color="success" variant="outlined" />
                <Box sx={{width:"100%"}}>
                    <DataGrid autoHeight
                        rows={this.state.attached_accounts}
                        columns={this.data.ColumnDefenition}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        onCellClick={this.detachCellClick}
                        sx={{
                            boxShadow: 2,
                            border: 2,
                            margin : 2,
                            borderColor: 'primary.light',
                            '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                            },
                        }}
                        getRowId={(row) => row.accountId} 
                    />
                </Box>
                {this.state.accountId_detach.length > 1 &&
                <Box sx={{width:"100%",m:2}}>
                <Button variant="contained" color="error" sx={{margin:1,border:2}} onClick={this.detach}>Detach</Button>
                </Box>}
            </Grid>
            
        </Grid>
        }
        </div>
    }
}

export default TagModify;