'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiURL } from '../../../../config.js';

export default function SignUpPage() {
    const [inputValues, setInputValues] = useState({ 
        firstName: '',
        lastName: '',
        role: '',
        privilege: 'user',
        username: '', 
        password: '',
        confirmPassword: '' 
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    
    const router = useRouter();

    useEffect(() => {
        if (!formSubmitted) {
            return;
        }

        async function sendFormData() {
            try {
                var fetchOptions = {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inputValues),
                    mode: 'cors',
                    credentials: 'include',
                    cache: 'no-store'
                }
                var fetchURL = apiURL + '/members/sign-up';
        
                var res = await fetch(fetchURL, fetchOptions);
                var data = await res.json();
        
                if (res.ok) {
                    router.push('/');
                    router.refresh();
                } else {
                    setFormErrors(data.errors);
                }
            } catch (err) {
                console.error('Sign up failed: ' + err);
                setFormErrors('Network error: please try again later');
            }

            setFormSubmitted(false);
        }
    
        sendFormData();
    }, [formSubmitted]);

    function handleFormSubmit(e) {
        e.preventDefault();
        setFormSubmitted(true);
    }

    function handleInputChange(e) {  
        var inputElem = e.target;
        setInputValues(prevState => {
            return { ...prevState, [inputElem.name]: inputElem.value };
        });      
    }

    return (
        <main>
            <h1>Sign Up</h1>

            {
                formErrors.length > 0 &&
                    <div>
                        <p>Sign up unsuccessful: </p>
                        <ul>
                            {
                                formErrors.map((errMsg) => {
                                    return <li key={errMsg}>{errMsg}</li>;
                                })
                            }
                        </ul>
                    </div>
            }

            <form onSubmit={ handleFormSubmit }>
                <label>
                    First Name:
                    <input 
                        type='text' name='firstName' value={inputValues.firstName} 
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <label>
                    Last Name: 
                    <input 
                        type='text' name='lastName' value={inputValues.lastName}
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <label>
                    Role: 
                    <input 
                        type='text' name='role' value={inputValues.role}
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <label>
                    Privilege: 
                    <select 
                        name='privilege' value={inputValues.privilege} 
                        onChange={ handleInputChange }
                    >
                        <option value='user'>User</option>
                        <option value='admin'>Admin</option>
                    </select>
                </label>
                <br/>

                <label>
                    Username: 
                    <input 
                        type='text' name='username' value={inputValues.username}
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <label>
                    Password: 
                    <input 
                        type='text' name='password' value={inputValues.password}
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <label>
                    Confirm Password: 
                    <input 
                        type='text' name='confirmPassword' value={inputValues.confirmPassword}
                        onChange={ handleInputChange }
                    >
                    </input>
                </label>
                <br/>

                <button type='submit'>Sign Up</button>
            </form>
        </main>
    );
}