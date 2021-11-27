import { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import '../styles/Sidebar.css';

function Sidebar() {
    return (
        <nav className='sidebar-container'>
            <List>
                <ListItem button key='Home'>
                    <ListItemIcon>
                        <HomeOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Home' />
                </ListItem>
                <ListItem button key='Projects'>
                    <ListItemIcon>
                        <AccountTreeOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Projects' />
                </ListItem>
                <ListItem button key='Tasks'>
                    <ListItemIcon>
                        <FormatListNumberedOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Tasks' />
                </ListItem>
                <ListItem button key='Team'>
                    <ListItemIcon>
                        <PeopleAltOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary='Team' />
                </ListItem>

                <Divider sx={{ margin: 1 }}/>

                <ListItem button key='Inbox'>
                    <ListItemIcon>
                        <MailTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary='Inbox' />
                </ListItem>
                <ListItem button key='Notifications'>
                    <ListItemIcon>
                        <NotificationsTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary='Notifications' />
                </ListItem>

                <Divider sx={{ margin: 1 }}/>

                <ListItem button key='My Account'>
                    <ListItemIcon>
                        <SettingsApplicationsIcon />
                    </ListItemIcon>
                    <ListItemText primary='My Account' />
                </ListItem>
            </List>
        </nav>
    );
}

export default Sidebar;