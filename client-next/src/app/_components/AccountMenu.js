'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_contexts/AuthContext';
import { useUserData } from '@/app/_hooks/hooks';
import { 
   Avatar, Menu, MenuItem, ListItemIcon, Divider, 
   IconButton, Tooltip, CircularProgress 
} from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountMenu() {
   const { setIsLoggedIn } = useAuth();

   const [anchorEl, setAnchorEl] = useState(null);
   const [loggingOut, setLoggingOut] = useState(false);

   const user = useUserData();
   const router = useRouter();

   const open = Boolean(anchorEl);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };
   
   async function handleLogOut(e) {
      e.stopPropagation();

      setLoggingOut(true);

      try {
         const fetchOptions = {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            mode: 'cors',
            credentials: 'include'
         }
         const fetchURL = apiURL + '/members/log-out';
      
         const res = await fetch(fetchURL, fetchOptions);
     
         if (res.ok) {
            //delete auth token
            localStorage.removeItem('token');

            setIsLoggedIn(false);
            router.push('/');
         } else {
            const data = await res.json();
            const errors = data.errors;
            throw Error('Logout unsuccessful: ' + errors[0]);
         }   
      } catch (err) {
        throw err;
      }
   }
   
   return (
      <>
         <div>
            <Tooltip title="Account menu">
               <IconButton onClick={handleClick} size="small" 
                  aria-label='account menu'
               >
                  <Avatar>{user ? user.firstName[0] + user.lastName[0] : 'user'}</Avatar>
               </IconButton>
            </Tooltip>
         </div>
         
         <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
               elevation: 0,
               sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                     width: 32,
                     height: 32,
                     ml: -0.5,
                     mr: 1,
                  },
                  '&:before': {
                     content: '""',
                     display: 'block',
                     position: 'absolute',
                     top: 0,
                     right: 14,
                     width: 10,
                     height: 10,
                     bgcolor: 'background.paper',
                     transform: 'translateY(-50%) rotate(45deg)',
                     zIndex: 0,
                  },
               },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
         >
            <MenuItem
               component={Link}
               href={'/account'}
            >
               <ListItemIcon>
                  <Settings fontSize="small" />
               </ListItemIcon>
               Account
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogOut}>
               {loggingOut
                  ?
                     <>
                        <CircularProgress size='1.4em' color='primary' 
                           thickness={5} sx={{ 'marginRight': '0.8em' }}
                        />
                        Logging Out...
                     </>
                  :
                     <>
                        <ListItemIcon>
                           <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                     </>
               }
            </MenuItem>
         </Menu>
      </>
   );
};