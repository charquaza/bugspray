import { Link } from 'react-router-dom';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
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
import '../styles/Sidebar.css';

function Sidebar() {
    return (
        <nav className='sidebar-container'>
            <List>
                <Link to='/dashboard'>
                    <ListItem button key='Home'>
                        <ListItemIcon>
                            <HomeOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary='Home' />
                    </ListItem>
                </Link>
                <Link to='/dashboard/projects'>
                    <ListItem button key='Projects'>
                        <ListItemIcon>
                            <AccountTreeOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary='Projects' />
                    </ListItem>
                </Link>
                <Link to='/dashboard/tasks'>
                    <ListItem button key='Tasks'>
                        <ListItemIcon>
                            <FormatListNumberedOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary='Tasks' />
                    </ListItem>
                </Link>
                <Link to='/dashboard/team'>
                    <ListItem button key='Team'>
                        <ListItemIcon>
                            <PeopleAltOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary='Team' />
                    </ListItem>
                </Link>

                <Divider sx={{ margin: 1 }}/>

                <Link to='/dashboard/inbox'>
                    <ListItem button key='Inbox'>
                        <ListItemIcon>
                            <MailTwoToneIcon />
                        </ListItemIcon>
                        <ListItemText primary='Inbox' />
                    </ListItem>
                </Link>
                <Link to='/dashboard/notifications'>
                    <ListItem button key='Notifications'>
                        <ListItemIcon>
                            <NotificationsTwoToneIcon />
                        </ListItemIcon>
                        <ListItemText primary='Notifications' />
                    </ListItem>
                </Link>

                <Divider sx={{ margin: 1 }}/>

                <Link to='/dashboard/account'>
                    <ListItem button key='My Account'>
                        <ListItemIcon>
                            <SettingsApplicationsIcon />
                        </ListItemIcon>
                        <ListItemText primary='My Account' />
                    </ListItem>
                </Link>
            </List>
        </nav>
    );
}

export default Sidebar;