import React from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider'
import AccountCreate from "./AccountCreate"
import AccountModify from "./AccountModify"

class AccountSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedTab:'create'};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        let selectedTab = event.target.id
        let confirm = window.confirm("You want to change the selected tab?")
        if (!confirm) return
       this.setState({selectedTab:event.target.id})
    }

    render() {
      return<div> <Box sx={{borderBottom: 5 ,borderColor: 'green',borderColortop: 'green',border: 1 ,margin: 1}}>
        <Tabs  value={this.state.selectedTab} onChange={this.handleChange}>
          <Tab label="New Account" value="create" id="create"/>
          <Tab label="Modify Account" value="modify" id="modify"/>
        </Tabs>
      </Box>
      <Box  sx={{border: 1,margin: 4,backgroundColor:'green',minWidth:390}}>
      <Box  sx={{border: 1,margin: 0.3,backgroundColor:'white'}}>
       <Divider/>
        {this.state.selectedTab == "create" && <AccountCreate/> }
        {this.state.selectedTab == "modify" && <AccountModify/> }
        </Box>
        </Box>
      </div>
    }
}

export default AccountSettings;