import React from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import commonUtils from '../../utils/commonUtils'
import apiUtil from '../../utils/apiUtil'
import {Typography,TextField,Grid,Button, Alert,Divider} from '@mui/material'
import { LoadingButton } from '@mui/lab';
import configData from "../../config.json"


class AccountCreate extends React.Component {
    constructor(props) {
        super(props);
        this.data = {
            form:{
                accountType:'',
                institution:'',
                accountNumber:'',
                accountNumber2:'',
                accountName:''
            }
        }
        this.state = {
                form_selectedAccountType:'',
                form_selectedInstitution:'',
                status_disableInstitutions: false,
                status_loading_submitbutton: false,
                status_submit_error: false,


                data_accountTypes : [],
                data_institutions : [],

                alert_accounts:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNT_SELECT,
                alert_accountnumber:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNTNUMBER_SELECT,
                alert_accountname:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNTNAME_SELECT,
                alert_accounts_severity:'info',
                alert_accountnumber_severity:'info',
                alert_accountname_severity:'info',
                alert_submit_error:''

        }
        this.onSelectInstitution = this.onSelectInstitution.bind(this)
        this.onSelectAccountType = this.onSelectAccountType.bind(this)
        this.changeAccountNumber = this.changeAccountNumber.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    async componentDidMount() {
        let accountTypes = apiUtil.callAsync('get_available_account_types',{})
        accountTypes.then(function(accountTypes){
            let accountTypesItems = []
            if(accountTypes == undefined || 'error' in accountTypes){console.log('Error in response.');return accountTypesItems}
            accountTypes.data.forEach(accountType => 
                {accountTypesItems.push({id:accountType,text:commonUtils.titleCase(accountType)})})
            return accountTypesItems
        })
        .then((items) => {this.setState({data_accountTypes:items})})
        .catch( function(error){console.log(error)})
    }


    onSelectAccountType(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.data.form.accountType = currentSelected
        this.setState({form_selectedAccountType:currentSelected,status_disableInstitutions:true})
        let institutions = apiUtil.callAsync('get_available_institutions',{'account_type':currentSelected})
        institutions.then(function(institutions){
            let institutionsItems = []
            institutions.data.forEach(institution => 
                {institutionsItems.push({id:institution,text:commonUtils.titleCase(institution)})})
            return institutionsItems
        })
        .then((items) => {this.setState({data_institutions:items,states_disableInstitutions:false})})
        .catch( function(error){console.log(error)})
    }

    onSelectInstitution(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.data.form.institution = currentSelected
        this.setState({form_selectedInstitution:currentSelected})
    }

    changeAccountNumber(event) {
       this.data.form[event.target.id] = event.target.value
    }


    validate() {
        if(this.data.form.accountType == '' || this.data.form.institution == '' ) {this.setState({
            alert_accounts_severity:'error',
            alert_accounts:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_ERROR_ACCOUNT_SELECT})
        return
        }
        if(this.data.form.accountNumber == '' || this.data.form.accountNumber2 == '') { this.setState({
                alert_accountnumber_severity:'error',
                alert_accountnumber:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_ERROR_ACCOUNTNUMBER_SELECT})
            return
        }
        if(this.data.form.accountNumber != this.data.form.accountNumber2) {this.setState({
                alert_accountnumber_severity:'error',
                alert_accountnumber:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_ERROR_ACCOUNTNUMBER_MISMATCH})
            return
        }
        if(this.data.form.accountName == '' ) {this.setState({
                alert_accountname_severity:'error',
                alert_accountname:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_ERROR_ACCOUNTNAME_SELECT})
            return
        }
        this.submitForm()
    }

    submitForm() {
        this.setState({status_loading_submitbutton: true},
            () => {
                let createStatus = apiUtil.callAsync('create_account',this.data.form)
                //Error keeps coming in check these parts
                createStatus.then((createStatus) => {
                    if('error' in createStatus){
                            this.setState({ status_loading_submitbutton:false,
                                            alert_submit_error:createStatus.error,
                                            status_submit_error:true})
                    }
                    this.setState({status_loading_submitbutton: false})
                })
                .catch(function(error){
                    this.setState({status_loading_submitbutton: false})
                })})
    }


    onSubmit(event) {
        this.setState({
            alert_accounts:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNT_SELECT,
            alert_accountnumber:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNTNUMBER_SELECT,
            alert_accountname:configData.ACCOUNT_MANAGEMENT.ALERTS.ALERT_INFO_ACCOUNTNAME_SELECT,
            alert_accounts_severity:'info',
            alert_accountnumber_severity:'info',
            alert_accountname_severity:'info',
            status_submit_error: false,
        },() => {this.validate()})
            
    }

    render() {
    return<div>
         <Grid container spacing={3}>
                <Grid item>
                    <Box sx={{margin:1,border:2}}>
                        <Alert severity={this.state.alert_accounts_severity}>{this.state.alert_accounts}</Alert>
                        <FormControl sx={{ m: 2, minWidth: 120,maxWidth: 400}}>
                            <InputLabel sx={{color:'blue',fontSize:11}}>Account Type</InputLabel>
                            <Select 
                                sx={{textAlign:"center"}}
                                value={this.state.form_selectedAccountType}
                                >
                                {this.state.data_accountTypes.map((item) => (
                                    <MenuItem value={item.id} id={item.id} key={item.id} onClick={this.onSelectAccountType}>
                                        <Typography variant="caption">{item.text}</Typography> 
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                       { this.state.states_disableInstitutions == false &&
                        <FormControl sx={{ m: 2, minWidth: 120}}>
                            <InputLabel sx={{color:'blue',fontSize:11}}>Bank/Institution</InputLabel>
                            <Select 
                                className=".Mui-disabled"
                                sx={{textAlign:"center"}}
                                value={this.state.form_selectedInstitution}
                                >
                                {this.state.data_institutions.length>0 && this.state.data_institutions.map((item) => (
                                    <MenuItem value={item.id} id={item.id} key={item.id} onClick={this.onSelectInstitution}>
                                        <Typography variant="caption">{item.text}</Typography> 
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        }
                    </Box>
            </Grid> 
           
            <Grid item>
                <Box sx={{margin:1,border:2}}>
                    <Alert severity={this.state.alert_accountnumber_severity}>{this.state.alert_accountnumber}</Alert>
                    <FormControl sx={{ m: 2, minWidth: 150,color:"red",backgroundColor:"white"}}>
                            <TextField
                                sx= {{fontSize:20,color:"red"}}
                                label="Account Number" 
                                onChange={this.changeAccountNumber}    
                                id = "accountNumber"           
                                />
                    </FormControl>
                    <FormControl sx={{ m: 2, minWidth: 150,color:"red"}}>
                            <TextField
                                sx= {{fontSize:20,color:"red"}}
                                label="Confirm Account Number"  
                                onChange={this.changeAccountNumber}  
                                id = "accountNumber2"              
                                />
                    </FormControl>
                </Box>
            </Grid> 
            <Grid item>
                <Box sx={{margin:1,border:2}}>
                    <Alert severity={this.state.alert_accountname_severity}>{this.state.alert_accountname}</Alert>
                    <FormControl sx={{ m: 2, minWidth: 300,color:"red",backgroundColor:"white"}}>
                            <TextField
                                sx= {{fontSize:20,color:"red"}}
                                label="Account Name"  
                                id = "accountName"
                                onChange={this.changeAccountNumber}  
                                />
                    </FormControl>
                </Box>
            </Grid>       
        </Grid>
        <Divider/>
        <Divider/>
        <Box sx={{width:'50%'}}>
            {this.state.status_submit_error &&
                <Alert severity="error">{this.state.alert_submit_error}</Alert>
            }
            <LoadingButton loading={this.state.status_loading_submitbutton}  loadingIndicator="Creating..." 
        variant="contained"  sx={{margin:1}} onClick={this.onSubmit}>Create Account</LoadingButton>
                </Box>
                <Divider/>
                <Divider/>

            </div> 
    }
}

export default AccountCreate;