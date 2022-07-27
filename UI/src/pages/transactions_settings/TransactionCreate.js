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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RemoveIcon from '@mui/icons-material/Remove';


/*
Fields reuired
Account From - Mandatory (dropdown)
Transaction ID/Reference - Mandaotry
Transaction Description - Give description
Transaction Date - just date is needed. No time now
Credit/Debit - TransactionType (value ) ==> to be get from the ddb like resource data



Account To - Not mandatory (dropwdown --> Ownaccounts + External)



*/



class TransactionCreate extends React.Component {
    
    constructor(props) {
        super(props);
        let dateString = new Date().toString().split(' ')
        dateString = dateString.slice(0,4).concat(dateString.slice(5)).join(' ')
        let txnTime = Date.parse(dateString)

        this.data = {
            transactionTypes:configData.TYPES.TRANSACTION_TYPES,
            txnTime: txnTime,
            ColumnDefenition: configData.TABLE_COLUMN_DEFENITIONS.TRANSACTION_ENTRIES,
            fromAccountName: '',
            toAccountName: 'External',
            txns: [],
           

        }


        this.state = {
            externalTxnId : '',
            txnType: 'DEBIT',
            fromAccount: '',
            toAccount:'EXTERNAL',
            txnTime: txnTime,
            txnDescription:'',
            txnAmount:'',
            fromAccountError:false,
            externalTxnIdError:false,
            txnDescriptionError:false,
            txns:[],
            modify:false,
            accounts: [],
            creating_transactions:false
        }

        this.onTextEnter = this.onTextEnter.bind(this)
        this.onSelectFromAccount = this.onSelectFromAccount.bind(this)
        this.onSelectTxnType = this.onSelectTxnType.bind(this)
        this.selectDate = this.selectDate.bind(this)
        this.onSelectToAccount = this.onSelectToAccount.bind(this)
        this.addButton = this.addButton.bind(this)
        this.deleteButton = this.deleteButton.bind(this)
        this.selectTransaction = this.selectTransaction.bind(this)
        this.addTransactions = this.addTransactions.bind(this)

    }

    async componentDidMount() {
        let accountTypes = apiUtil.callAsync('get_accounts',{})
        accountTypes.then((accountTypes) => {
            if('error' in accountTypes){this.setState({accounts:[]})}
            else{this.setState({accounts:accountTypes.data})}})
        .catch( function(error){console.log(error)})
    }

    onSelectTxnType(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.setState({txnType:currentSelected})
    }


    onTextEnter(event) {
        let state = {}
        state[event.target.id] = event.target.value
        if(event.target.id == 'txnAmount') {
            let value = event.target.value
            let regex = /^\d+\.?\d{0,2}?$/
            if(!regex.test(value)){return}
        }
        this.setState(state)
    }

    onSelectFromAccount(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.state.accounts.forEach(account => {
            if(account.accountId == currentSelected){this.data.fromAccountName = account.accountName}
        })
        this.setState({fromAccount:currentSelected})
    }

    onSelectToAccount(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.state.accounts.forEach(account => {
            if(account.accountId == currentSelected){this.data.toAccountName = account.accountName}
        })
        if(currentSelected == 'EXTERNAL')this.data.toAccountName='External'
        this.setState({toAccount:currentSelected})
    }

    selectDate(event) {
        let dateString = event.toString().split(' ')
        dateString = dateString.slice(0,4).concat(dateString.slice(5)).join(' ')
        let txnTime = Date.parse(dateString)
        this.data.txnTime = dateString
        this.setState({txnTime:txnTime})
    }


    verifyEntry(error){
        let errorState = {
            fromAccountError:false,
            externalTxnIdError:false,
            txnDescriptionError:false,
            txnAmountError:false
        }
        if(this.state.fromAccount == '')errorState.fromAccountError = true
        if(this.state.externalTxnId == '')errorState.externalTxnIdError = true
        if(this.state.txnDescription == '')errorState.txnDescriptionError = true
        if(this.state.txnAmount == '')errorState.txnAmountError = true
        if(!this.state.modify){
            this.data.txns.forEach(
                    txn => {if (txn.externalTxnId == this.state.externalTxnId){errorState.externalTxnIdError=true}})
        }
        return errorState
    }

    addButton() {
        let errorState = this.verifyEntry()
        let verifyError  = false 
        Object.entries(errorState).forEach(flags =>{verifyError = verifyError || flags[1]})
        if (verifyError) {
            this.setState(errorState)
        } else {
            if(this.state.modify){
                this.data.txns = this.data.txns.filter(txn => txn.externalTxnId!=this.state.externalTxnId)
            }

            let currentTag = {
                    externalTxnId : this.state.externalTxnId,
                    txnType: this.state.txnType,
                    fromAccount:this.state.fromAccount,
                    fromAccountName: this.data.fromAccountName,
                    toAccount:this.state.toAccount,
                    toAccountName:this.data.toAccountName,
                    txnAmount:this.state.txnAmount,
                    txnTime: new Date(this.data.txnTime).getTime(),
                    txnTimestamp: this.data.txnTime.toString(),
                    txnDescription:this.state.txnDescription ,
                    id:this.state.externalTxnId,
                }
                this.data.txns.push(currentTag)
                this.data.modify = false
                stateUtil.setState(this,'TRANSACTION_CREATE','RESET_TX',{txns:[...this.data.txns]})
        }
    }

    deleteButton() {
        let errorState = {
            fromAccountError:false,
            externalTxnIdError:false,
            txnDescriptionError:false,
            txnAmountError:false
        }
        if(this.state.modify) {
            this.data.txns = this.data.txns.filter(txn => txn.externalTxnId!=this.state.externalTxnId)
        } 
        errorState.txns =  [...this.data.txns]
        stateUtil.setState(this,'TRANSACTION_CREATE','RESET_TX',errorState)
    }

    addTransactions() {
        this.setState({creating_transactions:true})
        let create_transaction = apiUtil.callApi('create_transactions',{transactions:this.state.txns})
        create_transaction.then((create_transaction) =>{
            stateUtil.setState(this,'TRANSACTION_CREATE','RESET_TX',{txns:[]})
        })
        .catch(function(error){ 
                stateUtil.setState(this,'TRANSACTION_CREATE','RESET_TX',{txns:[]})
            })
    }

    get_desired_state_for_externalId(externalId) {
        let dateString = new Date().toString().split(' ')
        dateString = dateString.slice(0,4).concat(dateString.slice(5)).join(' ')
        let txnTime = Date.parse(dateString)
        if(externalId == null){
            return {
                externalTxnId : "",
                txnType: "DEBIT",
                fromAccount: "",
                toAccount:"",
                txnTime: txnTime,
                txnDescription:"",
                txnAmount:"",
                modify:false,
                fromAccountError:false,
                externalTxnIdError:false,
                txnDescriptionError:false,
                txnAmountError:false,
            }
        }
        let desiredState = {}
        this.data.txns.forEach(txn => {
            if(txn.id == externalId){
                desiredState = {
                    externalTxnId : txn.externalTxnId,
                    txnType: txn.txnType,
                    fromAccount: txn.fromAccount,
                    toAccount:txn.toAccount,
                    txnTime: new Date(txn.txnTime),
                    txnDescription:txn.txnDescription,
                    txnAmount:txn.txnAmount,
                    modify:true,
                    fromAccountError:false,
                    externalTxnIdError:false,
                    txnDescriptionError:false,
                    txnAmountError:false
                }
            }
        })
        return desiredState
    }

    selectTransaction(params,event){
        let ctrl = event.ctrlKey
        let id = params.id
        if(id != this.state.externalTxnId){this.setState(this.get_desired_state_for_externalId(id))}
        if(id == this.state.externalTxnId && ctrl){this.setState(this.get_desired_state_for_externalId(null))}
    }

    render() {
    return <div>
        <Box sx={{m:1,border:1}}>
        <Grid container sx={{width:'100%'}}>
            <Grid item sx={{width:'22%'}}>
                <FormControl sx={{ m: 2, width: '100%',color:"red",backgroundColor:"white"}}> 
                <InputLabel sx={{color:'blue',fontSize:11}}>From Account</InputLabel>
                    <Select 
                        sx={{textAlign:"center"}}
                        value={this.state.fromAccount}
                        error={this.state.fromAccountError}
                        >
                        {this.state.accounts.map((item) => (
                            <MenuItem value={item.accountId} id={item.accountId} key={item.accountId} onClick={this.onSelectFromAccount}>
                                <Typography variant="caption">{item.accountName}</Typography> 
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Grid>
            <Divider/>
            <Grid item sx={{width:'22%'}}>
                <FormControl sx={{ m: 2, width: '100%',color:"red",backgroundColor:"white"}}> 
                <InputLabel sx={{color:'blue',fontSize:11}}>Transaction Type</InputLabel>
                    <Select 
                        sx={{textAlign:"center"}}
                        value={this.state.txnType}
                        >
                        {this.data.transactionTypes.map((item) => (
                            <MenuItem value={item} id={item} key={item} onClick={this.onSelectTxnType}>
                                <Typography variant="caption">{commonUtils.titleCase(item)}</Typography> 
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Grid>
           
            <Grid item sx={{width:'22%'}}>
            <FormControl sx={{ m: 2, width: '100%',color:"red",backgroundColor:"white"}}> 
                <InputLabel sx={{color:'blue',fontSize:11}}>To Account</InputLabel>
                    <Select 
                        sx={{textAlign:"center"}}
                        value={this.state.toAccount}
                        >
                        <MenuItem value="EXTERNAL" id="EXTERNAL" key="EXTERNAL" onClick={this.onSelectToAccount}>
                            <Typography variant="caption">External Account</Typography> 
                        </MenuItem> 
                        {this.state.accounts.map((item) => (
                            <MenuItem value={item.accountId} id={item.accountId} key={item.accountId} onClick={this.onSelectToAccount}>
                                <Typography variant="caption">{item.accountName}</Typography> 
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item sx={{width:'22%'}}>
            <FormControl sx={{ m: 2, width: '100%',color:"red",backgroundColor:"white"}}> 
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Transaction Date"
                        value={this.state.txnTime}
                        onChange={this.selectDate}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>
                </FormControl>
            </Grid>
        </Grid>
        </Box>
        <Box sx={{margin:2,border:1}}>
            <Grid container>
                <Grid item sx={{width:'20%'}}>
                        <FormControl sx={{ m: 2, width:'100%',color:"red",backgroundColor:"white"}}> 
                        <TextField
                            value={this.state.externalTxnId}
                            disabled = {this.state.modify}
                            sx= {{fontSize:20,color:"red"}}
                            label="External Transaction ID/Reference ID"  
                            id = "externalTxnId"
                            error = {this.state.externalTxnIdError}
                            onChange={this.onTextEnter}  
                            />
                        </FormControl>
                    </Grid>
                    <Grid item sx={{width:'50%'}}>
                        <FormControl sx={{ m: 2, width:'100%',color:"red",backgroundColor:"white"}}> 
                        <TextField
                            value={this.state.txnDescription}
                            sx= {{fontSize:20,color:"red"}}
                            label="Transaction Description" 
                            id = "txnDescription"
                            error = {this.state.txnDescriptionError}
                            onChange={this.onTextEnter}  
                            />
                        </FormControl>
                    </Grid>
                    <Grid item sx={{width:'15%'}}>
                        <FormControl sx={{ m: 2, width:'100%',color:"red",backgroundColor:"white"}}> 
                        <TextField
                            value={this.state.txnAmount}
                            sx= {{fontSize:20,color:"red"}}
                            label="Transaction Amount" 
                            id = "txnAmount"
                            error = {this.state.txnAmountError}
                            onChange={this.onTextEnter}  
                            />
                        </FormControl>
                    </Grid>
            </Grid>
        </Box>
        <Button sx ={{margin:2}} variant="contained" onClick={this.addButton}>Add/Modify<AddBoxIcon/></Button>
        <Button sx ={{margin:2}} color="error" variant="contained" onClick={this.deleteButton}>Reset/Delete<IndeterminateCheckBoxIcon/></Button>
        <Divider/>
        <DataGrid autoHeight
            rows={this.state.txns}
            columns={this.data.ColumnDefenition}
            pageSize={3}
            rowsPerPageOptions={[3]}
            onCellClick={this.selectTransaction}
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

        <Box sx={{margin:2}}>
         <LoadingButton  loading={this.state.creating_transactions}  loadingIndicator="Creating..." 
                        variant="contained"  sx={{margin:1,border:2}} onClick={this.addTransactions}>Create Transactions<AddBoxIcon/></LoadingButton>
        </Box>

    </div>

    }
}

export default TransactionCreate;