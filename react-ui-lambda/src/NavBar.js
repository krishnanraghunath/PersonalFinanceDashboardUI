import React from "react";
import Button from "@awsui/components-react/button";
import SpaceBetween from "@awsui/components-react/space-between";
import "./index.css"

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this._state = {
            previous:"accountSettingButton"
        }
        this.state = {
            accountTransactionButton: "normal",
            accountSettingButton: "primary",
        }
        this.navigationSelect = this.navigationSelect.bind(this);

    }

    navigationSelect(selected) {
        let previous =  this._state.previous;
        if (selected == previous) return;
        var confirm = window.confirm(
            "Do you really want to change the current selection? (You may loose any progress)"
        )
        if (!confirm)
            return
        this._state.previous = selected;
        let state = {};
        state[selected] = "primary";
        state[previous] = "normal";
        this.setState(state);
        this.props.updateContent(selected)

    }

    render() {
        return <div><br/><br/><br/>
                <SpaceBetween id='0' direction="vertical" size="xxs">
                    <Button onClick={(a) => this.navigationSelect('accountSettingButton')} className="Navigation-Button"  variant={this.state.accountSettingButton}>Account Settings</Button>
                    <Button onClick={(a) => this.navigationSelect('accountTransactionButton')} className="Navigation-Button" variant={this.state.accountTransactionButton}>Account Transactions</Button>
                </SpaceBetween>
        </div>
    }
}
export default NavBar;
