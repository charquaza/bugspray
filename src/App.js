import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import NotFound from './components/NotFound';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import './styles/App.css';
import './styles/Logo.css';

function App() {
  const [currUser, setCurrUser] = useState(
    JSON.parse(localStorage.getItem('user'))
  );

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
          <Route path='/' element={currUser 
            ? <Navigate replace to='dashboard' /> 
            : <LandingPage setCurrUser={setCurrUser} />} 
          />
          <Route path='dashboard' 
            element={currUser ? <Dashboard setCurrUser={setCurrUser} /> 
              : <Navigate replace to='/' />} 
          >
            <Route path=':view' 
              element={<Dashboard setCurrUser={setCurrUser} />} 
            />
          </Route>
          <Route path='sign-up' element={<SignUp />} />
          <Route path='log-in' element={<LogIn />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ThemeProvider> 
    </BrowserRouter>
  );
}

export default App;
