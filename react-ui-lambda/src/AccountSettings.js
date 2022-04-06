import React from "react";
import {Tabs} from "@awsui/components-react";
import NavBar from "./NavBar";
import AccountCreate from "./AccountCreate";

class AccountSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeTabId: "create" }
        this.select = this.select.bind(this);
    }

    select(selected) {
        var confirm = window.confirm(
            "Do you really want to change the current selection? (You may loose any progress)")
        if (!confirm)return
        this.setState({activeTabId:selected.detail.activeTabId})
    }

    render() {
        return <Tabs  activeTabId = {this.state.activeTabId} variant='container' onChange={this.select} tabs={[
            {id:'create',label:'Create Account',content:  React.createElement(AccountCreate,{updateContent:null})},
            {id:'modify',label:'Modify Account',content: <div>asddf</div>}]}>
        </Tabs>
    }
}

export default AccountSettings;