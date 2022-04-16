import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import apiUtil from '../../utils/apiUtil'
import configData from '../../config.json'
import {Box,Grid} from '@mui/material'
import { LoadingButton } from '@mui/lab';

class AccountModify extends React.Component {
    constructor(props) {
        super(props);
        this.data = {
            ColumnDefenition : configData.TABLE_COLUMN_DEFENITIONS.ACCOUNT_DETAILS
        }
        this.state = {
            data_rows :[],
            selected_accountId:null,
            status_loading_delete_button:false
        }

        this.selectCell = this.selectCell.bind(this)
        this.selectPage = this.selectPage.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    selectCell(params,event) {
        this.setState({selected_accountId:params.id})
    }

    selectPage(params) {
        this.setState({selected_accountId:null})
    }

    onSubmit() {
        if (this.state.selected_accountId == null) return
        this.setState({status_loading_delete_button:true},()=>{
            let deleteResponse = apiUtil.callAsync('delete_account',{'accountId':this.state.selected_accountId})
            deleteResponse.then((deleteResponse) => {
                this.setState({status_loading_delete_button:false})
            })
            .catch(function(error){this.setState({status_loading_delete_button:false})})
        })

    }

    async componentDidMount() {
        apiUtil.callAsync('get_accounts',{})
            .then((items) => {this.setState({data_rows:items.data})})
            .catch( function(error){console.log(error)})
    }

    render() {
    return   <Grid container spacing={0}>
                 <Grid item sx={{width:"100%"}}>
                <Box sx={{width:"100%"}}>
                    <DataGrid autoHeight
                        rows={this.state.data_rows}
                        columns={this.data.ColumnDefenition}
                        pageSize={3}
                        rowsPerPageOptions={[3]}
                        onCellClick={this.selectCell}
                        onPageChange={this.selectPage}
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
                </Grid>
                <Grid item sx={{width:"25%"}}>
                
                <Box sx={{width:"100%",margin:1}}>
                    {this.state.selected_accountId &&
                    <LoadingButton color="error" loading={this.state.status_loading_delete_button}  loadingIndicator="Deleting..." 
                        variant="contained"  sx={{margin:1,border:2}} onClick={this.onSubmit}>Delete Account</LoadingButton>
                    }
                </Box>
                </Grid>
            </Grid>
    }
}

export default AccountModify;