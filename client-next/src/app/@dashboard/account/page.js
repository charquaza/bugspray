'use client'

import { useState, useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import styles from '@/app/_styles/accountPage.module.css';

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

export default function AccountPage({ params }) {
   const [user, setUser] = useState();
   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [changePassword, setChangePassword] = useState(false);
   const [updateUser, setUpdateUser] = useState(false);
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
         } else if (errMsg.search(/role/i) !== -1) {
            errorMap.set('role', true);
         } else if (errMsg.search(/username/i) !== -1) {
            errorMap.set('username', true);
         } else if (errMsg.search(/new password/i) !== -1) {
            errorMap.set('newPassword', true);
            errorMap.set('confirmNewPassword', true);
         } else if (errMsg.search(/incorrect password/i) !== -1) {
            errorMap.set('currPassword', true);
         } else if (errMsg.search(/slack member id/i) !== -1) {
            errorMap.set('slackMemberId', true);
         }
      });
      return errorMap;
   }, [formErrors]);

   useEffect(function getUser() {
      //only run on initial render and 
      //after each successful update call to api
      if (user && !updateUser) {
         return;
      }

      async function fetchUser() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            }
            const fetchURL = apiURL + '/members/curr-user';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const userData = data.data;
               setUser(userData);
               setUpdateUser(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
     }

      fetchUser();
   }, [user, updateUser]);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };

         var fetchOptions = {
            method: 'PUT',
            headers: { 
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(fetchBody),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         var fetchURL = apiURL + '/members/' + user._id;

         var res = await fetch(fetchURL, fetchOptions);

         if (res.ok) {
            setUpdateUser(true);
            setChangePassword(false); 
            setFormErrors([]); 
            setInUpdateMode(false);
         } else {
            if (res.status === 403 || res.status === 404) {
               setError(new Error('Server error: ' + res.status));
            } else {
               var data = await res.json();
               setFormErrors(data.errors);   
            }
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleUpdateModeToggle(e) {
      if (!inUpdateMode) {
         //Before rendering update form:

         setInputValues({ 
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            username: user.username, 
            currPassword: '',
            slackMemberId: user.slackMemberId || ''
         });
         //reset form errors
         setFormErrors([]);
      } else {
         //clean up password change UI
         if (changePassword) {
            setInputValues(prevState => {
               let copy = { ...prevState };
               delete copy.newPassword;
               delete copy.confirmNewPassword;
   
               return copy;
            });     
            setChangePassword(false);   
         }
      }

      setInUpdateMode(prev => !prev);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
   }

   function handleChangePassword(e) {
      if (changePassword) {
         //user canceled password change, remove fields from inputValues
         setInputValues(prevState => {
            let copy = { ...prevState };
            delete copy.newPassword;
            delete copy.confirmNewPassword;

            return copy;
         });     
      } else {
         setInputValues(prevState => {
            return {
               ...prevState,
               newPassword: '',
               confirmNewPassword: ''
            };
         });
      }

      setChangePassword(prevState => !prevState);
   }

   return (
      <main className={styles['account-page']}>
         {user && 
            <>
               <h1>Account</h1>

               {inUpdateMode 
                  ?
                     <>
                        {
                           formErrors.length > 0 &&
                              <div className={styles['error-container']}>
                                 <p>Account edit unsuccessful: </p>
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
                              type='text' id='slackMemberId' name='slackMemberId'
                              label='Slack Member ID' variant='filled' 
                              margin='normal' value={inputValues.slackMemberId}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('slackMemberId')}
                           />

                           <div className={styles['change-password-ctnr']}>
                              {changePassword
                                 ?
                                    <>
                                       <div className={styles['new-password-inputs-ctnr']}>
                                          <CustomTextField
                                             type='password' id='newPassword' name='newPassword'
                                             required label='New Password' variant='filled'
                                             margin='normal' value={inputValues.newPassword}
                                             onChange={handleInputChange}
                                             error={inputsWithErrors.has('newPassword')}
                                          />
   
                                          <CustomTextField
                                             type='password' id='confirmNewPassword' name='confirmNewPassword'
                                             required label='Confirm New Password' variant='filled'
                                             margin='normal' value={inputValues.confirmNewPassword}
                                             onChange={handleInputChange}
                                             error={inputsWithErrors.has('confirmNewPassword')}
                                          />   
                                       </div>
                                       <button type='button' onClick={handleChangePassword}>Cancel</button>
                                    </>
                                 :
                                    <button type='button' onClick={handleChangePassword}>Change Password</button>                    
                              }
                           </div>

                           <CustomTextField
                              type='password' id='currPassword' name='currPassword'
                              required label='Current Password' variant='filled'
                              margin='normal' value={inputValues.currPassword}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('currPassword')}
                           />
                           
                           <div className={styles['form-controls-ctnr']}>
                              <button type='submit' className={styles['submit-btn']}>Save</button>
                              <button type='button' className={styles['cancel-btn']} 
                                 onClick={handleUpdateModeToggle}
                              >Cancel</button>
                           </div>
                        </form>
                     </>
                  :
                     <>
                        <ul className={styles['user-info']}>
                           <li>
                              <span className={styles['label']}>First Name:</span> 
                              <span className={styles['info']}>{user.firstName}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Last Name:</span> 
                              <span className={styles['info']}>{user.lastName}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Username:</span>
                              <span className={styles['info']}>{user.username}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Date Joined:</span>
                              <span className={styles['info']}>
                                 {DateTime.fromISO(user.dateJoined).toLocaleString(DateTime.DATE_MED)}
                              </span>
                           </li>
                           <li>
                              <span className={styles['label']}>Role:</span>
                              <span className={styles['info']}>{user.role}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Privilege:</span>
                              <span className={styles['info']}>{user.privilege}</span>
                           </li>
                           {user.slackMemberId &&
                              <li>
                                 <span className={styles['label']}>Slack Member ID:</span>
                                 <span className={styles['info']}>{user.slackMemberId}</span>
                              </li>
                           }
                        </ul>

                        <div>
                           <button className={styles['edit-btn']} onClick={handleUpdateModeToggle}>Edit</button>
                        </div>
                     </>
               }
            </>
         }
      </main>
   );
};