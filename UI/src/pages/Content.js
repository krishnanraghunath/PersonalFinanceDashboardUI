import React from "react";
import AccountSettings from "./account_settings/AccountSettings";
class Content extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        if (this.props.selected === "PAGE_MY_ACCOUNTS") {
            return <AccountSettings/>
        }else {
            return <div>Test</div>
        }
    }
}

export default Content;