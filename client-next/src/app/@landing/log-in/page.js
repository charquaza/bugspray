'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TextField, Button, CircularProgress } from '@mui/material';
import Logo from '@/app/_components/Logo';
import styles from '@/app/_styles/logInPage.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

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
               setFormErrors([]);
            } else {
               setFormErrors(data.errors);
               setFormSubmitted(false);
            }
         } catch (err) {
            console.error('Login failed: ' + err);
            setFormErrors([ 'Network error: please try again later' ]);
            setFormSubmitted(false);
         }
      }
   
      sendFormData();
   }, [formSubmitted, inputValues, router]);

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
      <div className={styles['login-page']}>
         <div className={styles['login-container']}>
            <header>
               <Link href='/'>
                  <div className={styles['logo-container']}>
                     <Logo />
                  </div>
               </Link>
            </header>
      
            <main>
               <h1>Log In</h1>
      
               {
                  formErrors.length > 0 &&
                     <div className={styles['error-container']}>
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
                  <TextField 
                     type='text' id='username' name='username'
                     required label='Username' variant='outlined' 
                     margin='normal' value={inputValues.username}
                     onChange={ handleInputChange }
                     error={formErrors.length > 0}
                  />
   
                  <TextField 
                     type='password' id='password' name='password'
                     required label='Password' variant='outlined' 
                     margin='normal' value={inputValues.password}
                     onChange={ handleInputChange }
                     error={formErrors.length > 0}
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
                           Log In
                        </Button>
                  }
               </form>

               <div className={styles['sign-up-link-ctnr']}>
                  <Link href='/sign-up'>Don&apos;t have an account?</Link>
               </div>
            </main>
         </div>
   </div>
   );
};