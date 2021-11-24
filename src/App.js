import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './components/Home';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import NotFound from './components/NotFound';
import Dashboard from './components/Dashboard';
import './styles/App.css';
import './styles/Logo.css';

function App() {
  var theme = createTheme({
    palette: {
      primary: {
        main: 'rgb(84,188,124)',
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
      borderRadius: 8,
    }
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='sign-up' element={<SignUp />} />
          <Route path='log-in' element={<LogIn />} />
          {/* remove dashboard route after development */}
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ThemeProvider> 
    </BrowserRouter>
  );
}

export default App;
