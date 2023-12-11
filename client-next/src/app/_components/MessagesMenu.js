'use client'

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import MailIcon from '@mui/icons-material/Mail';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function MessagesMenu() {
   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   return (
      <>
         <div>
            <Tooltip title="Messages">
               <IconButton onClick={handleClick} size="small" 
                  aria-label='messages'
               >
                  <Badge badgeContent={2} color='secondary'>
                     <MailIcon sx={{ width: 27, height: 27 }} />
                  </Badge>
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
            <MenuItem>
               <ListItemIcon>
                  <Avatar>John</Avatar>
               </ListItemIcon>
               Hi, this is John...
            </MenuItem>
            <Divider />
            <MenuItem>
               <ListItemIcon>
                  <Avatar>Mary</Avatar>
               </ListItemIcon>
               I wanted to let you know that...
            </MenuItem>
         </Menu>
      </>
   );
}

export default MessagesMenu;