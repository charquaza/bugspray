import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import Logo from './Logo';
import '../styles/Topbar.css';

function Topbar() {
    return (
        <header className='topbar-container'>
            <ul>
                <li>
                    <IconButton aria-label='menu'>
                        <MenuIcon />
                    </IconButton>
                </li>
                <li>
                    <Link to='/'>
                        <div className='logo-brand-container'>
                            <Logo />
                            <p className='brand-name'>MoveForward</p>
                        </div>
                    </Link>
                </li>
                <li>
                    <SearchBar />
                </li>
            </ul>
                
            <ul>
                <li>
                    <IconButton className='hide-mobile' aria-label='messages'>
                        <MailOutlineIcon />
                    </IconButton>
                </li>
                <li>
                    <IconButton className='hide-mobile' aria-label='notifications'>
                        <NotificationsNoneIcon />
                    </IconButton>   
                </li>
                <li>
                    <IconButton aria-label='user account'>
                        <Avatar>User</Avatar>
                    </IconButton>
                </li>
            </ul>
        </header>
    );
}

export default Topbar;