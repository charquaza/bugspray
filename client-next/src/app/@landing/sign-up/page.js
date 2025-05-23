'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_contexts/AuthContext';
import { 
   Button, TextField, CircularProgress
} from '@mui/material';
import Logo from '@/app/_components/Logo';
import styles from '@/app/_styles/signUpPage.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function SignUpPage() {
   const { setIsLoggedIn } = useAuth();
   
   const [inputValues, setInputValues] = useState({ 
      firstName: '',
      lastName: '',
      role: '',
      username: '', 
      password: '',
      confirmPassword: '',
      slackMemberId: ''
   });
   const [formSubmitted, setFormSubmitted] = useState(false);
   const [formErrors, setFormErrors] = useState([]);
   
   const router = useRouter();

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/first name/i) !== -1) {
            errorMap.set('firstName', true);
         } else if (errMsg.search(/last name/i) !== -1) {
            errorMap.set('lastName', true);
         } else if (errMsg.search(/role/i) !== -1) {
            errorMap.set('role', true);
         } else if (errMsg.search(/username/i) !== -1) {
            errorMap.set('username', true);
         } else if (errMsg.search(/password/i) !== -1) {
            errorMap.set('password', true);
         } else if (errMsg.search(/slack member id/i) !== -1) {
            errorMap.set('slackMemberId', true);
         }
      });
      return errorMap;
   }, [formErrors]);

   useEffect(() => {
      if (!formSubmitted) {
         return;
      }

      async function sendFormData() {
         try {
            var fetchOptions = {
               method: 'POST',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token'),
                  'Content-Type': 'application/json'
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
               //store auth token in localStorage
               localStorage.setItem('token', data.token);

               setIsLoggedIn(true);
               router.push('/');
               setFormErrors([]);
            } else {
               setFormErrors(data.errors);
               setFormSubmitted(false);
            }
         } catch (err) {
            console.error('Sign up failed: ' + err);
            setFormErrors([ 'Network error: please try again later' ]);
            setFormSubmitted(false);
         }
      }
   
      sendFormData();
   }, [formSubmitted, inputValues, router]);

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
      <div className={styles['signup-page']}>
         <div className={styles['signup-container']}>
            <header>
               <Link href='/'>
                  <div className={styles['logo-container']}>
                     <Logo />
                  </div>
               </Link>
            </header>
   
            <main>
               <h1>Sign Up</h1>
      
               {
                  formErrors.length > 0 &&
                     <div className={styles['error-container']}>
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
                  <div className={styles['name-inputs-container']}>
                     <TextField 
                           type='text' id='firstName' name='firstName'
                           required label='First Name' variant='outlined' 
                           margin='normal' value={inputValues.firstName}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('firstName')}
                     />
                     <TextField 
                           type='text' id='lastName' name='lastName'
                           required label='Last Name' variant='outlined' 
                           margin='normal' value={inputValues.lastName}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('lastName')}
                     />
                  </div>  
                   
                  <TextField 
                     type='text' id='role' name='role'
                     required label='Role' variant='outlined' 
                     margin='normal' value={inputValues.role}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('role')}
                  />
      
                  <TextField 
                     type='text' id='username' name='username'
                     required label='Username' variant='outlined' 
                     margin='normal' value={inputValues.username}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('username')}
                  />
   
                  <TextField 
                     type='password' id='password' name='password'
                     required label='Password' variant='outlined' 
                     margin='normal' value={inputValues.password}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('password')}
                  />
   
                  <TextField 
                     type='password' id='confirmPassword' name='confirmPassword'
                     required label='Confirm Password' variant='outlined' 
                     margin='normal' value={inputValues.confirmPassword}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('password')}
                  />

                  <TextField 
                     type='text' id='slackMemberId' name='slackMemberId'
                     label='Slack Member ID (optional)' variant='outlined' 
                     margin='normal' value={inputValues.slackMemberId}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('slackMemberId')}
                  />
         
                  {formSubmitted 
                     ?
                        <Button type='submit' variant='contained' size='large'
                           disabled={true}
                        >
                           <CircularProgress size='1.4em' color='primary' 
                              thickness={5}
                           />
                        </Button>
                     :
                        <Button type='submit' variant='contained' size='large'>
                           Sign Up
                        </Button>
                  }
               </form>
   
               <div className={styles['log-in-link-ctnr']}>
                  <Link href='/log-in'>Already have an account?</Link>
               </div>
            </main>
         </div>
      </div>
   );
};