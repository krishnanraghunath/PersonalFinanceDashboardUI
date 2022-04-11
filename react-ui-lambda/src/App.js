import NavBar from "./NavBar";
import Content from "./pages/Content"
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
        console.log(selected)
        this.setState({selected})
    }

    render() {
       return <div>
           <NavBar updateContent={this.updateContent}/>
           <Content selected={this.state.selected}/>
           </div>
    }
}

export default App;