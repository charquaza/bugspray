'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiURL } from '@/root/config.js';
import { 
   Button, TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import Logo from '@/app/_components/Logo';
import styles from '@/app/_styles/signUpPage.module.css';

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

   const inputsWithErrors = new Map();
   formErrors.forEach((errMsg) => {
      if (errMsg.search(/first name/i) !== -1) {
         inputsWithErrors.set('firstName', true);
      } else if (errMsg.search(/last name/i) !== -1) {
         inputsWithErrors.set('lastName', true);
      } else if (errMsg.search(/role/i) !== -1) {
         inputsWithErrors.set('role', true);
      } else if (errMsg.search(/privilege/i) !== -1) {
         inputsWithErrors.set('privilege', true);
      } else if (errMsg.search(/username/i) !== -1) {
         inputsWithErrors.set('username', true);
      } else if (errMsg.search(/password/i) !== -1) {
         inputsWithErrors.set('password', true);
      }
   });

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
            setFormErrors([ 'Network error: please try again later' ]);
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

               <FormControl fullWidth margin='normal'>
                  <InputLabel id='privilege'>Privilege</InputLabel>
                  <Select
                     labelId='privilege'
                     value={inputValues.privilege}
                     label='Privilege'
                     name='privilege'
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('privilege')}
                  >
                     <MenuItem value='user'>User</MenuItem>
                     <MenuItem value='admin'>Admin</MenuItem>
                  </Select>
               </FormControl>

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
      
               <Button type='submit' variant='contained' size='large'>Sign Up</Button>
            </form>
         </main>
      </div>   
   );
};