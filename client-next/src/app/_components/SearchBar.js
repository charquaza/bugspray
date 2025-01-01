'use client'

import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
   const Search = styled('div')(({ theme }) => ({
      display: 'none',
      [theme.breakpoints.up(425)]: {
         display: 'block',
         position: 'relative',
         borderRadius: theme.shape.borderRadius,
         backgroundColor: alpha(theme.palette.common.white, 0.15),
         '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
         },
         marginRight: theme.spacing(2),
         marginLeft: theme.spacing(3),
         width: 'auto'
      }
   }));
  
   const SearchIconWrapper = styled('div')(({ theme }) => ({
      display: 'none',
      [theme.breakpoints.up(425)]: {
         padding: theme.spacing(0, 1),
         height: '100%',
         position: 'absolute',
         pointerEvents: 'none',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
      }
   }));
  
   const StyledInputBase = styled(InputBase)(({ theme }) => ({
      display: 'none',
      [theme.breakpoints.up(425)]: {
         display: 'block',
         color: 'inherit',
         '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // horizontal padding + font size from searchIcon
            paddingLeft: theme.spacing(5),
            transition: theme.transitions.create('width'),
            width: `calc(100% - ${theme.spacing(6.5)})`
         },
      }
   }));

   return (
      <Search>
         <SearchIconWrapper>
            <SearchIcon />
         </SearchIconWrapper>
         <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
         />
      </Search>
   );
};