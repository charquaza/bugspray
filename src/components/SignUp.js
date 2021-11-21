import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Logo from './Logo';
import '../styles/SignUp.css';

function SignUp() {
    const [inputValues, setInputValues] = useState(
        { 
            first_name: '',
            last_name: '',
            email: '', 
            password: '',
            confirm_password: ''
        }
    );

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
        <div className='signup-container'>
            <header>
                <Logo />
            </header>

            <main>
                <h1>Sign Up</h1>

                <form onSubmit={handleFormSubmit}>
                    <div className='name-inputs-container'>
                        <TextField 
                            type='text' id='first-name' name='first_name'
                            required label='First Name' variant='outlined' 
                            margin='normal' value={inputValues.first_name}
                            onChange={handleInputChange}
                        />
                        <TextField 
                            type='text' id='last-name' name='last_name'
                            required label='Last Name' variant='outlined' 
                            margin='normal' value={inputValues.last_name}
                            onChange={handleInputChange}
                        />
                    </div>
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
                    <TextField 
                        type='password' id='confirm-password' name='confirm_password'
                        required label='Confirm Password' variant='outlined' 
                        margin='normal' value={inputValues.confirm_password}
                        onChange={handleInputChange}
                    />
                    <Button type='submit' variant='contained' size='large'>Sign Up</Button>
                </form>
            </main>
        </div>
    );
}

export default SignUp;