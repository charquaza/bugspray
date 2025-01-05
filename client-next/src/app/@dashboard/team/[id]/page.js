'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';
import styles from '@/app/_styles/memberDetailsPage.module.css';

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

export default function MemberDetailsPage({ params }) {
   const user = useUserData();

   const [memberData, setMemberData] = useState();
   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [changePassword, setChangePassword] = useState(false);
   const [updateMemberData, setUpdateMemberData] = useState(false);
   const [formErrors, setFormErrors] = useState([]);
   const [deleteErrors, setDeleteErrors] = useState([]);
   const [error, setError] = useState();

   const router = useRouter();

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
         } else if (errMsg.search(/new password/i) !== -1) {
            errorMap.set('newPassword', true);
            errorMap.set('confirmNewPassword', true);
         }
      });
      return errorMap;
   }, [formErrors]);
   
   useEffect(function fetchMemberData() {
      //only run on initial render and 
      //after each successful update call to api
      if (memberData && !updateMemberData) {
         return;
      }

      async function getMemberData() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/members/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const memberData = data.data;
               setMemberData(memberData);
               setUpdateMemberData(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      getMemberData();
   }, [memberData, updateMemberData, params.id]);

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
         var fetchURL = apiURL + '/members/' + memberData._id;

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateMemberData(true);
            setFormErrors([]); 
            setInUpdateMode(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleUpdateModeToggle(e) {
      if (!inUpdateMode) {
         //Before rendering update form:

         setInputValues({ 
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            role: memberData.role,
            privilege: memberData.privilege,
            username: memberData.username
         });
         //reset form errors
         setFormErrors([]);
         setDeleteErrors([]);
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

   async function handleMemberDelete(e) {
      try {
         const fetchOptions = {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         };
         const fetchURL = apiURL + '/members/' + memberData._id;

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            router.push('/team');
         } else {
            const errors = data.errors;
            setDeleteErrors(errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   return (
      <main className={styles['member-details-page']}>
         {memberData && 
            <>
               <h1>Member Details</h1>

               {deleteErrors.length > 0 &&
                  <div className={styles['error-container']}>
                     <p>Member remove unsuccessful: </p>
                     <ul>
                           {
                              deleteErrors.map((errMsg) => {
                                 return <li key={errMsg}>{errMsg}</li>;
                              })
                           }
                     </ul>
                  </div>
               }

               {inUpdateMode 
                  ?
                     <>
                        {formErrors.length > 0 &&
                           <div className={styles['error-container']}>
                              <p>Member edit unsuccessful: </p>
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
                              <span className={styles['info']}>{memberData.firstName}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Last Name:</span> 
                              <span className={styles['info']}>{memberData.lastName}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Username:</span>
                              <span className={styles['info']}>{memberData.username}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Date Joined:</span>
                              <span className={styles['info']}>
                                 {DateTime.fromISO(memberData.dateJoined).toLocaleString(DateTime.DATE_MED)}
                              </span>
                           </li>
                           <li>
                              <span className={styles['label']}>Role:</span>
                              <span className={styles['info']}>{memberData.role}</span>
                           </li>
                           <li>
                              <span className={styles['label']}>Privilege:</span>
                              <span className={styles['info']}>{memberData.privilege}</span>
                           </li>
                        </ul>

                        {(user && user.privilege === 'admin') && 
                           <div>
                              <button className={styles['edit-btn']} onClick={handleUpdateModeToggle}>Edit</button>
                              <button className={styles['delete-btn']} onClick={handleMemberDelete}>Remove</button>
                           </div>
                        }
                     </>
               }
            </>
         }
      </main>
   );
};