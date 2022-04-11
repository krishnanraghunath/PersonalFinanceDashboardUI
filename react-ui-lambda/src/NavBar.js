import React from "react";
// import Button from "@awsui/components-react/button";
import SpaceBetween from "@awsui/components-react/space-between";
import "./index.css"


import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';



class NavBar extends React.Component {
    constructor(props) {
        super(props);
        console.log(props)
        this.menu_items = {
                pages : [
                    {id:'PAGE_MY_ACCOUNTS',label:'Accounts Management'},
                    {id:'PAGE_MY_TAGS',label:'Tags Management'}
                ],
                settings: [
                    {id: 'PROFILE_SIGNOUT',label:'Signout'}
                ]
        }
        this._state = {
            previous:"accountSettingButton"
        }
        this.state = {
            anchorElNav: null,
            anchorElUser: null,
        }
        // this.navigationSelect = this.navigationSelect.bind(this);
        this.handleOpenNavMenu = this.handleOpenNavMenu.bind(this);
        this.handleOpenUserMenu = this.handleOpenUserMenu.bind(this);
        this.handleMenuSelect = this.handleMenuSelect.bind(this);
    }

    handleOpenNavMenu(event)  {this.setState({anchorElNav:event.currentTarget})}

    handleOpenUserMenu(event) {this.setState({anchorElUser:event.currentTarget})}

    handleMenuSelect (event)  {
        try{
            var selectedId = event.target.id
            if (selectedId == ''){selectedId = event.target.offsetParent.id} 
            console.log(selectedId)
            this.props.updateContent(selectedId)
        } catch(error) {}
        this.setState({anchorElNav:null,anchorElUser:null})
    }


    render() {
        return  <AppBar position="static">
            <Container maxWidth="xl">
            <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
               Personal Finance Dashboard
            </Typography>
  
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={this.handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(this.state.anchorElNav)}
                onClose={this.handleMenuSelect}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {this.menu_items.pages.map((page) => (
                  <MenuItem key={page.label} id={page.id} onClick={this.handleMenuSelect}>
                    <Typography textAlign="center">{page.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h4"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              Personal Finance Dashboard
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {this.menu_items.pages.map((page) => (
                <Button
                  key={page.label}
                  id={page.id}
                  onClick={this.handleMenuSelect}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.label}
                </Button>
              ))}
            </Box>
  
            <Box sx={{ flexGrow: 0}}>
              <Tooltip title="Open settings">
                <IconButton onClick={this.handleOpenUserMenu} sx={{ p: 0 }}>
                  {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={this.state.anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(this.state.anchorElUser)}
                onClose={this.handleMenuSelect}
              >
                {this.menu_items.settings.map((setting) => (
                  <MenuItem key={setting.label} id={setting.id} onClick={this.handleMenuSelect}>
                    <Typography textAlign="center">{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    }
}
export default NavBar;


