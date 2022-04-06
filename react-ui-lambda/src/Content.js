import React from "react";
import AccountSettings from "./AccountSettings";
class Content extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        if (this.props.selected == "accountSettingButton") {
            return <AccountSettings/>
        }else {
            return <div>Anagha</div>
        }
    }
}

export default Content;