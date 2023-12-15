import NavBar from "./NavBar";
import Content from "./pages/Content"
import React from "react";



class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected:'PAGE_MY_ACCOUNTS'
        }
        this.updateContent = this.updateContent.bind(this)
    }
    updateContent = (selected) => {
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