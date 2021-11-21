import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './components/Home';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import NotFound from './components/NotFound';
import './styles/App.css';

function App() {
  var theme = createTheme({
    palette: {
      primary: {
        main: '#00ab55',
      },
      secondary: {
        main: '#f50057',
      }
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      button: {
        textTransform: 'none',
      }
    },
    shape: {
      borderRadius: 5,
    }
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='sign-up' element={<SignUp />} />
          <Route path='log-in' element={<LogIn />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ThemeProvider> 
    </BrowserRouter>
  );
}

export default App;
