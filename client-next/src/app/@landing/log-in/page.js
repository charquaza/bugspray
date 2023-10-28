'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiURL } from '../../../../config.js';

export default function LogInPage() {
    const [inputValues, setInputValues] = useState({ username: '', password: '' });
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
                var fetchURL = apiURL + '/members/log-in';
        
                var res = await fetch(fetchURL, fetchOptions);
                var data = await res.json();
        
                if (res.ok) {
                    router.push('/');
                    router.refresh();
                } else {
                    setFormErrors(data.errors);
                }
            } catch (err) {
                console.error('Login failed: ' + err);
                setFormErrors([ 'Network error: please try again later' ]);
            }

            setFormSubmitted(false);
        }
    
        sendFormData();
    }, [formSubmitted]);

    function handleFormSubmit(e) {
        e.preventDefault();

        // sendFormData();

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
            <h1>Log In</h1>

            {
                formErrors.length > 0 &&
                    <div>
                        <p>Log in unsuccessful: </p>
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
                    Username:
                    <input type='text' name='username' value={inputValues.username} 
                        onChange={ handleInputChange }>
                    </input>
                </label>

                <br/>

                <label>
                    Password: 
                    <input type='text' name='password' value={inputValues.password}
                        onChange={ handleInputChange }>
                    </input>
                </label>

                <br/>

                <button type='submit'>Log In</button>
            </form>
        </main>
    );
}