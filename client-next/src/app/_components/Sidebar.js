'use client'

import Link from 'next/link';
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
import styles from '@/app/_styles/Sidebar.module.css';

export default function Sidebar(props) {
   function handleClick(e) {
      //close sidebar if a menu link is clicked
      if (e.target.matches('a *')) {
         props.setSidebarOpen(false);
      }
   }

   return (
      <nav className={styles['sidebar-container']}>
         <List onClick={handleClick}>
            <Link href='/'>
               <ListItem button key='Home'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <HomeOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary='Home' />
               </ListItem>
            </Link>
            <Link href='/projects'>
               <ListItem button key='Projects'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <AccountTreeOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary='Projects' />
               </ListItem>
            </Link>
            <Link href='/tasks'>
               <ListItem button key='Tasks'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <FormatListNumberedOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary='Tasks' />
               </ListItem>
            </Link>
            <Link href='/team'>
               <ListItem button key='Team'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <PeopleAltOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary='Team' />
               </ListItem>
            </Link>

            <Divider sx={{ margin: 1 }}/>

            <Link href='/inbox'>
               <ListItem button key='Inbox'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <MailTwoToneIcon />
                  </ListItemIcon>
                  <ListItemText primary='Inbox' />
               </ListItem>
            </Link>
            <Link href='/notifications'>
               <ListItem button key='Notifications'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <NotificationsTwoToneIcon />
                  </ListItemIcon>
                  <ListItemText primary='Notifications' />
               </ListItem>
            </Link>

            <Divider sx={{ margin: 1 }}/>

            <Link href='/account'>
               <ListItem button key='My Account'>
                  <ListItemIcon sx={{ 'min-width': '45px' }}>
                     <SettingsApplicationsIcon />
                  </ListItemIcon>
                  <ListItemText primary='My Account' />
               </ListItem>
            </Link>
         </List>
      </nav>
   );
};