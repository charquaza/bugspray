'use client'

import { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import styles from '@/app/_styles/MemberCreateForm.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

const CustomTextField = styled(TextField)({
   'marginTop': '0',
   'width': '100%',
   'marginBottom': '0.8em',
   'maxWidth': '300px',
   'backgroundColor': '#f6fffb',
   '& .MuiInputBase-input': {
      'paddingTop': '1.7em',
      'paddingBottom': '0.4em'
   },
   '& .MuiFilledInput-root': {
      fontSize: '1.1em',
      borderRadius: '0.3em',
      '&:before': { borderBottom: 'none' },
      '&:after': { borderBottom: 'none' }
   },
   '& .MuiInputLabel-root': {
      fontSize: '1.3em',
   },
});

export default function MemberCreateForm({ setUpdateMemberList }) {
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/first name/i) !== -1) {
            errorMap.set('firstName', true);
         } else if (errMsg.search(/last name/i) !== -1) {
            errorMap.set('lastName', true);
         } else if (errMsg.search(/username/i) !== -1) {
            errorMap.set('username', true);
         } else if (errMsg.search(/role/i) !== -1) {
            errorMap.set('role', true);
         } else if (errMsg.search(/privilege/i) !== -1) {
            errorMap.set('privilege', true);
         } else if (errMsg.search(/password/i) !== -1) {
            errorMap.set('password', true);
            errorMap.set('confirmPassword', true);
         } else if (errMsg.search(/slack member id/i) !== -1) {
            errorMap.set('slackMemberId', true);
         }
      });
      return errorMap;
   }, [formErrors]);
   
   function handleCreateToggle() {
      if (!showCreateForm) {
         //Before rendering create form:
         //initialize inputValues

         setInputValues({ 
            firstName: '',
            lastName: '',
            role: '',
            privilege: 'user',
            username: '', 
            password: '',
            confirmPassword: '',
            slackMemberId: ''
         });
         //reset form errors
         setFormErrors([]);
      }

      setShowCreateForm(prevState => !prevState);
   }

   function handleInputChange(e) {  
      const inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
   }

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         const fetchBody = { ...inputValues };

         const fetchOptions = {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchBody),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         const fetchURL = apiURL + '/members';

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            if (setUpdateMemberList) {
               setUpdateMemberList(true);
            }
            setFormErrors([]); 
            setShowCreateForm(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   return (
      <div className={styles['member-create-form-ctnr']}>
         {showCreateForm 
            ?
               <>
                  {
                     formErrors.length > 0 &&
                        <div className={styles['error-container']}>
                           <p>Member creation unsuccessful: </p>
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
                     <div className={styles['first-last-name-ctnr']}>
                        <CustomTextField 
                           type='text' id='firstName' name='firstName'
                           required label='First Name' variant='filled' 
                           margin='normal' value={inputValues.firstName}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('firstName')}
                        />

                        <CustomTextField 
                           type='text' id='lastName' name='lastName'
                           required label='Last Name' variant='filled' 
                           margin='normal' value={inputValues.lastName}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('lastName')}
                        />
                     </div>

                     <CustomTextField
                        type='text' id='username' name='username'
                        required label='Username' variant='filled'
                        margin='normal' value={inputValues.username}
                        onChange={handleInputChange}
                        error={inputsWithErrors.has('username')}
                     />

                     <CustomTextField 
                        type='text' id='role' name='role'
                        required label='Role' variant='filled' 
                        margin='normal' value={inputValues.role}
                        onChange={handleInputChange}
                        error={inputsWithErrors.has('role')}
                     />

                     <CustomTextField 
                        select id='privilege' name='privilege'
                        required label='Privilege' variant='filled' 
                        margin='normal' value={inputValues.privilege}
                        onChange={handleInputChange}
                        error={inputsWithErrors.has('privilege')}
                        sx={{'maxWidth': '100px'}}
                     >
                        {[
                           <MenuItem key='user' value='user'>User</MenuItem>,
                           <MenuItem key='admin' value='admin'>Admin</MenuItem>
                        ]}
                     </CustomTextField>

                     <CustomTextField 
                        type='text' id='slackMemberId' name='slackMemberId'
                        label='Slack Member ID' variant='filled' 
                        margin='normal' value={inputValues.slackMemberId}
                        onChange={handleInputChange}
                        error={inputsWithErrors.has('slackMemberId')}
                     />

                     <div className={styles['password-inputs-ctnr']}>
                        <CustomTextField
                           type='password' id='password' name='password'
                           required label='Password' variant='filled'
                           margin='normal' value={inputValues.password}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('password')}
                        />

                        <CustomTextField
                           type='password' id='confirmPassword' name='confirmPassword'
                           required label='Confirm Password' variant='filled'
                           margin='normal' value={inputValues.confirmPassword}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('confirmPassword')}
                        />   
                     </div>

                     <div className={styles['form-controls-ctnr']}>
                        <button type='submit' className={styles['submit-btn']}>Create</button>
                        <button type='button' className={styles['cancel-btn']} 
                           onClick={handleCreateToggle}
                        >Cancel</button>
                     </div>
                  </form>
               </>
            :
               <button className={styles['create-btn']} onClick={handleCreateToggle}>Create New Member</button>
         }
      </div>
   );
};