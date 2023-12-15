import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import apiUtil from '../../utils/apiUtil'
import configData from '../../config.json'
import {Alert,Box,Grid,FormControl,InputLabel,Select,MenuItem,Typography,TextField,Button,Divider,Chip} from '@mui/material'
import { LoadingButton } from '@mui/lab';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import commonUtils from '../../utils/commonUtils'
import tagUtils from '../../utils/tagUtils'
import stateUtil from '../../utils/stateUtil'
import Autocomplete from '@mui/material/Autocomplete';





class TagCreate extends React.Component {
    
    constructor(props) {
        super(props);
        this.tagUtil  = new tagUtils();
        this.data = {
            ColumnDefenition : configData.TABLE_COLUMN_DEFENITIONS.TAG_CREATE,
            SHOW_INPUTS : ['REGEX','GT','LT'],
            statement:{id:null,lOperand:'',operation:'',rOperand:''},
            tagName:''
        }
        this.state = {
            statement:{ id:null,lOperand:'',operation:'', rOperand:''},
            tagName:'',
            errors:{lOperand:false,operation:false,rOperand:false},
            statement_show_input:false,
            status_loading_create_button: false,
            status_searching_tag: false,
            alert_submit_error:false,
            alert_submit_success:false,
            addRowError: false,
            data_rows :[],
            statements : ['txnDescription','txnAmount','txnType','txnDestination'],
            operations : ['REGEX','OR','AND','GT','LT'],


            tag_search:{loading:false,disabled:true},
            tag_value:{ disabled:false,error:false},
            tagFoundStatus: 0,
            user_tags_data:[]
        }

        this.onSelectLOperand = this.onSelectLOperand.bind(this)
        this.onSelectROperand = this.onSelectROperand.bind(this)
        this.onSelectOperation = this.onSelectOperation.bind(this)
        this.changeRightOperator = this.changeRightOperator.bind(this)
        this.addButton = this.addButton.bind(this)
        this.deleteButton = this.deleteButton.bind(this)
        this.selectStatement = this.selectStatement.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.onSearchTag = this.onSearchTag.bind(this)
        this.autoComplete = this.autoComplete.bind(this)
        this.reset = this.reset.bind(this)
    }


    _copy_row_state(tagId) {
        let tagInfo = this.tagUtil.getTagStatement(tagId)
        if(tagInfo){
            this.data.statement = {...tagInfo}
        }else{
            this.data.statement = {
                id:commonUtils.getRandomAlphabetString(3),
                lOperand:'',
                operation:'',
                rOperand:'',
            }
        }
    }

    _sync_row_state() {
        this.setState({
            statement:{...this.data.statement},
            statement_show_input:this.data.SHOW_INPUTS.includes(this.data.statement.operation),
            data_rows:this.tagUtil.getTags(),
            statements:this.tagUtil.getStatements(),
            addRowError:false,
            alert_submit_error:false,
            alert_submit_success:false
        })
    }

    _get_selected_event(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        return currentSelected 
    }

    onSelectLOperand(event) {
        let currentSelectedId = this._get_selected_event(event)
        if(this.state.statements.includes(currentSelectedId)) {
            this.data.statement.lOperand = currentSelectedId
            this._sync_row_state()
        }
    }

    onSelectOperation(event) {
        let currentSelectedId = this._get_selected_event(event)
        if(this.state.operations.includes(currentSelectedId)) {
            this.data.statement.operation = currentSelectedId
            this._sync_row_state()
        }
    }

    onSelectROperand(event) {
        let currentSelectedId = this._get_selected_event(event)
        if(this.state.statements.includes(currentSelectedId)) {
            this.data.statement.rOperand = currentSelectedId
            this._sync_row_state()
        }
    }

    changeRightOperator(event) {
        let id = event.target.id 
        if(id == 'rOperatorValue'){
            this.data.statement.rOperand = event.target.value
            this._sync_row_state()
        }
    }


    verifyTagStatement(){
        let verifyState = {lOperand:false,operation:false,rOperand:false}
        if(this.data.statement.lOperand == "")verifyState.lOperand=true
        if(this.data.statement.operation == "")verifyState.operation=true
        if(this.data.statement.rOperand == "")verifyState.rOperand=true
        return verifyState
    }

    addButton() {
        if(this.data.statement.id == null)
            this.data.statement.id = commonUtils.getRandomAlphabetString(3)
        let verifyState = this.verifyTagStatement()
        if(verifyState.lOperand || verifyState.operation || verifyState.rOperand) {
            this.setState({errors:verifyState}) 
        } else{
            if(this.tagUtil.addTag(this.data.statement))
                this._copy_row_state(null)
            this._sync_row_state()
            this.setState({errors:verifyState})
        }
    }
        


    deleteButton() {
    if(this.tagUtil.getUpstreamDependencies(this.data.statement).length == 0){
        this.tagUtil.removeTag(this.data.statement)
        this._copy_row_state(null)
        this._sync_row_state()
    } else {
       this.setState({addRowError:true})
    }

    }


    selectStatement(params,event) {
        let ctrl = event.ctrlKey
        let id = params.row.id
        if(id != this.data.statement.id) {
            this._copy_row_state(params.row.id)
            this._sync_row_state()
            return
        }
        if(id == this.data.statement.id && ctrl) {
            this._copy_row_state(null)
            this._sync_row_state()
            return
        }
            this._copy_row_state(params.row.id)
            this._sync_row_state()
    }



    onSubmit() {
        let tagRules = this.tagUtil.getTagRules()
        if(tagRules == null){this.setState({alert_submit_error:true});return}
        let create_form = {
            tagName:this.state.tagName,
            tagRules:tagRules
        }
        if (this.state.tagFoundStatus == 2) create_form.modify = true //If tag is already found toggling modify param
        this.setState({status_loading_create_button: true,alert_submit_error:false},
            () => {
                let createStatus = apiUtil.callAsync('create_tag',create_form)
                createStatus.then((createStatus) => {
                    this.tagUtil.clear()
                    if('error' in createStatus){this.setState({ status_loading_create_button:false,alert_submit_error:true})}
                    else{
                        //Status button to be changed to upper part
                        this.setState({status_loading_create_button: false,alert_submit_success:true})
                    }

                })
                .catch(function(error){this.setState({status_loading_create_button: false})})})
    }

    onSearchTag(){
        this.tagUtil.clear()
        stateUtil.setState(this,'TAG_CREATE','TAG_SEARCHING')
        this.tagUtil.getUserTagForTagId(this,this.state.tagName,function(reference,error,data){
                if(error){stateUtil.setState(reference,'TAG_CREATE','TAG_SEARCH_NOT_FOUND');return}
                else{
                    Object.entries(data.tagRules).forEach(tagRule => {
                        let id = tagRule[0]
                        if (id == 'root')id = commonUtils.getRandomAlphabetString(3)
                        tagRule[1].id = id
                        reference.tagUtil.addTag(tagRule[1])
                    })
                }
                reference._copy_row_state(null)
                reference._sync_row_state()
                stateUtil.setState(reference,'TAG_CREATE','TAG_SEARCH_FOUND')
        })
    }


    componentDidMount() {
        stateUtil.disable(this,'tag_value')
        this.tagUtil.getUserTags(this,function(reference,error,data){
            if(error){}
            else{reference.setState({user_tags_data:data})}
            stateUtil.enable(reference,'tag_value')
        })
    }

    autoComplete(event,value,reason) {
        if (value == null)this.data.tagName = ''
        else this.data.tagName = value.trim()
        if(this.data.tagName.length > 5){stateUtil.enable(this,'tag_search',{tagName:this.data.tagName})}
        else {stateUtil.disable(this,'tag_search',{tagName:this.data.tagName})}
    }


    reset() {
        stateUtil.setState(this,'TAG_CREATE','INITIAL_STATE')
    }

    render() {
    return <div>
        {/* Top container start */}
        <Grid container>
            <Grid item>
                <FormControl sx={{ m: 2, minWidth: 300,color:"red",backgroundColor:"white"}}> 
                <Autocomplete
                        freeSolo
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
                        <Button variant="contained" color="error" sx={{margin:1,border:2}} onClick={this.reset}>Reset</Button>
                            }
                </Box>
            </Grid>
        </Grid>
        <Divider/>
         {/* Top container end */}
       
        <Box sx={{width:"100%",m:2}}>
        {this.state.tagName.length >5 && <Chip label={"Tag Name: " + this.state.tagName} color="secondary" variant="outlined" />}
        {this.state.tagFoundStatus == 1 && <Chip label="New Tag" color="success" variant="outlined" />}
        {this.state.tagFoundStatus == 2 &&  <Chip label="Existing Tag" color="error" variant="outlined" />}
        </Box>
  
        {this.state.tagFoundStatus > 0 && 
        <Grid container spacing={0}>
                <Grid item sx={{width:"100%"}}>
                        <Box sx = {{border:1,margin:2,width:'75%'}}>
                            <FormControl sx={{ m: 2, minWidth: 150,color:"red",backgroundColor:"white"}}>
                                <InputLabel sx={{color:'blue',fontSize:11}}>Left Operand</InputLabel>
                                <Select 
                                    sx={{textAlign:"center"}}
                                    value={this.state.statement.lOperand}
                                    onClick={this.onSelectLOperand}
                                    error = {this.state.errors.lOperand}
                                    >
                                    {this.state.statements.length>0 && this.state.statements.map((item) => (
                                        <MenuItem value={item} id={item} key={item}>
                                            <Typography variant="caption">{item}</Typography> 
                                        </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 2, minWidth: 150,color:"red",backgroundColor:"white"}}>
                                <InputLabel sx={{color:'blue',fontSize:11}}>Operator</InputLabel>
                                <Select 
                                    sx={{textAlign:"center"}}
                                    value={this.state.statement.operation}
                                    onClick={this.onSelectOperation}
                                    error = {this.state.errors.operation}
                                    >
                                    {this.state.operations.length>0 && this.state.operations.map((item) => (
                                        <MenuItem value={item} id={item} key={item}>
                                            <Typography variant="caption">{item}</Typography> 
                                        </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            {this.state.statement_show_input == false && <FormControl sx={{ m: 2, minWidth: 150,color:"red",backgroundColor:"white"}}>
                            <InputLabel sx={{color:'blue',fontSize:11}}>Right Operand</InputLabel>
                                <Select 
                                    sx={{textAlign:"center"}}
                                    value={this.state.statement.rOperand}
                                    onClick={this.onSelectROperand}
                                    error = {this.state.errors.rOperand}
                                    >
                                    {this.state.statements.length>0 && this.state.statements.map((item) => (
                                        <MenuItem value={item} id={item} key={item}>
                                            <Typography variant="caption">{item}</Typography> 
                                        </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>}
                            {this.state.statement_show_input &&      
                            <FormControl sx={{ m: 2, minWidth: 150,color:"red",backgroundColor:"white"}}> 
                            <TextField
                                    value={this.state.statement.rOperand}
                                    sx= {{fontSize:20,color:"red"}}
                                    label="Operator Value"  
                                    id = "rOperatorValue"
                                    onChange={this.changeRightOperator}  
                                    />
                            </FormControl>}
                            <Divider/>
                            {this.state.addRowError &&
                            <Alert severity="error">Can not delete the Row. There are dependencies on the Statements</Alert>
                                }
                            <FormControl sx={{ m: 2, minWidth: 75,color:"red",backgroundColor:"white"}}> 
                            <Button variant="contained" onClick={this.addButton}>Add/Modify<AddBoxIcon/></Button>
                            </FormControl>
                            <FormControl sx={{ m: 2, minWidth: 75,color:"red",backgroundColor:"white"}}> 
                            <Button color="error" variant="outlined" onClick={this.deleteButton}>Delete<IndeterminateCheckBoxIcon/></Button>
                            </FormControl>

             
                         
                </Box>
                <Box sx={{width:"100%"}}>
                    <DataGrid autoHeight
                        rows={this.state.data_rows}
                        columns={this.data.ColumnDefenition}
                        pageSize={3}
                        rowsPerPageOptions={[3]}
                        onCellClick={this.selectStatement}
                        // onPageChange={this.selectPage}
                        sx={{
                            boxShadow: 2,
                            border: 2,
                            margin : 2,
                            borderColor: 'primary.light',
                            '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                            },
                        }}
                    />
                </Box>
                </Grid>
                <Grid item sx={{width:"100%"}}>
                {this.state.alert_submit_error &&
                <Alert severity="error">Please recheck the tag statements.Inconsistancy detected.</Alert>}
                {this.state.alert_submit_success &&
                <Alert severity="success">Succesfully updated the entry</Alert>}
                <Box sx={{width:"100%",margin:1}}>
                    <LoadingButton  loading={this.state.status_loading_create_button}  loadingIndicator="Creating..." 
                        variant="contained"  sx={{margin:1,border:2}} onClick={this.onSubmit}>Create Tag</LoadingButton>
                </Box>
                </Grid>
    
                </Grid>}
                </div>

    }
}

export default TagCreate;