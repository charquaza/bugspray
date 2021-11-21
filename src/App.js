import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import NotFound from './components/NotFound';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='sign-up' element={<SignUp />} />
        <Route path='log-in' element={<LogIn />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
