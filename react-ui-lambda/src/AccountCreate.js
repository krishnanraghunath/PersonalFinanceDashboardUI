import React from "react";
import {ButtonDropdown, Form, Input, Tabs} from "@awsui/components-react";
import NavBar from "./NavBar";
import SpaceBetween from "@awsui/components-react/space-between";
import Button from "@awsui/components-react/button";

class AccountCreate extends React.Component {
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
        return <Form>
            <ButtonDropdown items={[{text:'Bank Account'},{text:'Credit Card'}]}/>
        </Form>
    }
}

export default AccountCreate;