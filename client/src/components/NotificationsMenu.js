import { useState } from 'react';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function NotificationsMenu() {
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
        <Tooltip title="Notifications">
          <IconButton onClick={handleClick} size="small" 
            aria-label='notifications'
          >
            <Badge badgeContent={2} color='secondary'>
              <NotificationsIcon sx={{ width: 27, height: 27 }} />
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
          <PriorityHighIcon sx={{ mr: '5px' }} />
          John reported an issue.
        </MenuItem>
        <Divider />
        <MenuItem>
          <BugReportIcon sx={{ mr: '5px' }} />
          Mary fixed a bug!
        </MenuItem>
      </Menu>
    </>
  );
}

export default NotificationsMenu;