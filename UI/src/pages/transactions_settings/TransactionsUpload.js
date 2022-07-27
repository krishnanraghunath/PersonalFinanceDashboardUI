import React from "react";
import apiUtil from '../../utils/apiUtil'
import configData from '../../config.json'
import {TextField,Box,Grid,FormControl,InputLabel,Select,MenuItem,Typography,IconButton,Button,Alert} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { styled } from '@mui/material/styles';

const Input = styled('input')({
    display: 'none',
  });

class TransactionsUpload extends React.Component {
    
    constructor(props) {
        super(props);

        this.data = {
                files : ''
        }
        this.state = {
            accounts: [],
            transactionAccount:'',
            file:'',
            uploaded:0,
        }
        this.onSelect = this.onSelect.bind(this)
        this.upload = this.upload.bind(this)
        this.onSelectFromAccount = this.onSelectFromAccount.bind(this)


    }

    onSelectFromAccount(event) {
        let currentSelected = event.target.id
        if(currentSelected == '') currentSelected = event.target.parentElement.id
        this.setState({transactionAccount:currentSelected})
    }

    async componentDidMount() {
        let accountTypes = apiUtil.callAsync('get_accounts',{})
        accountTypes.then((accountTypes) => {
            if('error' in accountTypes){this.setState({accounts:[]})}
            else{this.setState({accounts:accountTypes.data})}})
        .catch( function(error){console.log(error)})
    }

    onSelect(event) {
        this.data.files = event.target.files[0]
        this.setState({file:this.data.files.name,uploaded:0})
    }

    upload(){
        const data = new FormData();
        data.append('transactionsFile',this.data.files );
        data.append('accountId', this.state.transactionAccount);
         fetch("/jsapi/upload_transactions", {
            method: 'POST',
            body: data
        }).then((response) =>  {
            if('error' in response){this.setState({file:'',transactionAccount:'',uploaded:2})}
            else{this.setState({file:'',transactionAccount:'',uploaded:1})}
        })
    }

    render() {
    return <div>
            {this.state.uploaded == 2 &&
                <Alert severity="error">Error occured during File Upload</Alert>
            }
            {this.state.uploaded == 1 &&
                <Alert severity="success">Successfully uploaded the File</Alert>
            }
            <Box sx={{m:1,border:1}}>
                <Grid container sx={{width:'100%'}}>
                    <Grid item sx={{width:'22%'}}>
                        <FormControl sx={{ m: 2, width: '100%',color:"red",backgroundColor:"white"}}> 
                        <InputLabel sx={{color:'blue',fontSize:11}}>Account Name</InputLabel>
                            <Select 
                                sx={{textAlign:"center"}}
                                value={this.state.transactionAccount}
                                >
                                {this.state.accounts.map((item) => (
                                    <MenuItem value={item.accountId} id={item.accountId} key={item.accountId} onClick={this.onSelectFromAccount}>
                                        <Typography variant="caption">{item.accountName}</Typography> 
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sx={{width:'10%'}}></Grid>
                    <Grid item sx={{width:'50%'}}>
                        {this.state.transactionAccount.length > 0 &&
                        <Box sx={{m:2}}>
                            <FormControl sx={{m:1,width: '5%',color:"red",backgroundColor:"white"}}>          
                                <label htmlFor="icon-button-file">
                                    <Input accept="application/pdf,text/csv,text/plain" id="icon-button-file" type="file" onChange={this.onSelect}/>
                                    <IconButton color="primary" aria-label="upload picture" component="span">
                                    <AttachFileIcon />
                                    </IconButton>
                                </label>
                            </FormControl>
                            <FormControl sx={{ width: '50%',color:"red",backgroundColor:"white"}}> 
                                <TextField
                                value={this.state.file}
                                sx= {{fontSize:20,color:"red"}}
                                InputProps={{
                                    readOnly: true,
                                  }} 
                                >
                                </TextField>
                          
                            </FormControl>
                            <FormControl sx={{m:1,width: '20%',color:"red",backgroundColor:"white"}}>   
                            {this.state.file.length > 0 &&       
                            <Button 
                                    variant="contained" 
                                    component="span"
                                    endIcon={<FileUploadIcon/>}
                                    onClick={this.upload}
                                    >
                                Upload
                                </Button>}
                            </FormControl>
                        </Box>}
                    </Grid>
                </Grid>
            </Box>  
    </div>
    }
}

export default TransactionsUpload;