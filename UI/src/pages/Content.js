import React from "react";
import AccountSettings from "./account_settings/AccountSettings";
import TagSettings from "./tag_settings/TagSettings"
class Content extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        if (this.props.selected === "PAGE_MY_ACCOUNTS") {
            return <AccountSettings/>
        }else {
            return <TagSettings/>
        }
    }
}

export default Content;