import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Logo from './Logo';
import '../styles/LogIn.css';

function LogIn() {
    const [inputValues, setInputValues] = useState({ email: '', password: '' });

    
    function handleFormSubmit(e) {
        e.preventDefault();
    }
    
    function handleInputChange(e) {
        var inputElem = e.target;
        setInputValues(prevState => {
            return { ...prevState, [inputElem.name]: inputElem.value };
        });
    }

    return (
        <div className='login-container'>
            <header>
                <Logo />
            </header>

            <main>
                <h1>Log In</h1>

                <form onSubmit={handleFormSubmit}>
                    <TextField 
                        type='email' id='email' name='email'
                        required label='Email' variant='outlined' 
                        margin='normal' value={inputValues.email}
                        onChange={handleInputChange}
                    />
                    <TextField 
                        type='password' id='password' name='password'
                        required label='Password' variant='outlined' 
                        margin='normal' value={inputValues.password}
                        onChange={handleInputChange}
                    />
                    <Button type='submit' variant='contained' size='large'>Log In</Button>
                </form>
            </main>
        </div>
    );
}

export default LogIn;