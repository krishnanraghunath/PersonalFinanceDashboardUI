import AppLayout from "@awsui/components-react/app-layout";
import NavBar from "./NavBar";
import Content from "./Content"
import Button from "@awsui/components-react/button";
import React from "react";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected:'accountSettingButton'
        }
        this.updateContent = this.updateContent.bind(this)
    }
    updateContent = (selected) => {
        this.setState({selected})
    }

    render() {
       return <AppLayout
            navigation={ <NavBar updateContent={this.updateContent}/>}
            content={<Content selected={this.state.selected}/>}
        /> ;
    }
}

export default App;