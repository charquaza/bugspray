import { createTheme } from '@mui/material/styles';

export default createTheme({
   palette: {
      primary: {
         main: 'rgb(84,188,124)',
      },
      secondary: {
         main: '#f50057',
      }
   },
   typography: {
      fontFamily: 'inherit',
      button: {
         textTransform: 'none',
      }
   },
   shape: {
      borderRadius: 8,
   }
});
