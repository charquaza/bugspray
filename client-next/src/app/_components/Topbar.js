'use client'

import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from './SearchBar';
import MessagesMenu from './MessagesMenu';
import NotificationsMenu from './NotificationsMenu';
import AccountMenu from './AccountMenu';
import Logo from './Logo';
import styles from '@/app/_styles/Topbar.module.css';

export default function Topbar(props) {
   function handleMenuIconClick() {
      props.setSidebarOpen(prevState => !prevState);
   }

   return (
      <header className={styles['topbar-container']}>
         <ul>
            <li>
               <IconButton aria-label='menu'
                  onClick={handleMenuIconClick}
               >
                  <MenuIcon />
               </IconButton>
            </li>
            <li className={styles['home-link-container']}>
               <Link href='/'>
                  <div className={styles['logo-brand-container']}>
                     <Logo />
                     <p className={styles['brand-name']}>MoveForward</p>
                  </div>
               </Link>
            </li>
            <li>
               <SearchBar />
            </li>
         </ul>
            
         <ul>
            <li className={styles['hide-mobile']}>
               <MessagesMenu />
            </li>
            <li className={styles['hide-mobile']}>
               <NotificationsMenu />   
            </li>
            <li>
               <AccountMenu setCurrUser={props.setCurrUser} />
            </li>
         </ul>
      </header>
   );
}