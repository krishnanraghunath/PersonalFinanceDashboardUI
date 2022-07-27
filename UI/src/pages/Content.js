import React from "react";
import AccountSettings from "./account_settings/AccountSettings";
import TagSettings from "./tag_settings/TagSettings"
import TransactionsSettings from "./transactions_settings/TransactionsSettings"
class Content extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        if (this.props.selected === "PAGE_MY_ACCOUNTS") {
            return <AccountSettings/>
        }
        if (this.props.selected === "PAGE_MY_TAGS") { 
            return <TagSettings/>
        }
        if (this.props.selected === "PAGE_ACCOUNT_TRANSACTIONS") { 
            return <TransactionsSettings/>
        }
    }
}

export default Content;