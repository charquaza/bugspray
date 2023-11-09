'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';

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
            currPassword: ''
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
      <main>
         { 
            user && 
               <>
                  <h1>Account</h1>

                  {
                     inUpdateMode 
                        ?
                           <>
                              {
                                 formErrors.length > 0 &&
                                    <div>
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
                                    Username: 
                                    <input 
                                       type='text' name='username' value={inputValues.username}
                                       onChange={ handleInputChange }
                                    >
                                    </input>
                                 </label>
                                 <br/>

                                 {
                                    changePassword 
                                       ?
                                          <>
                                             <label>
                                                New Password: 
                                                <input 
                                                   type='text' name='newPassword' value={inputValues.newPassword}
                                                   onChange={ handleInputChange }
                                                >
                                                </input>
                                             </label>
                                             <br/>
            
                                             <label>
                                                Confirm New Password: 
                                                <input 
                                                   type='text' name='confirmNewPassword' value={inputValues.confirmNewPassword}
                                                   onChange={ handleInputChange }
                                                >
                                                </input>
                                             </label>
                                             <br/>

                                             <div>
                                                <button type='button' onClick={handleChangePassword}>Cancel</button>
                                             </div>
                                          </>    
                                       :
                                          <button type='button' onClick={handleChangePassword}>Change Password</button>                             
                                 }

                                 <div>
                                    <br/>
                                    <label>
                                       Please Enter Current Password: 
                                       <input 
                                          type='text' name='currPassword' value={inputValues.currPassword}
                                          onChange={ handleInputChange }
                                       >
                                       </input>
                                    </label>
                                 </div>
                                
                                 <div>
                                    <button type='submit'>Save</button>
                                    <button type='button' 
                                       onClick={handleUpdateModeToggle}
                                    >Cancel</button>
                                 </div>                              
                              </form>
                           </>
                        :
                           <>
                              <ul>
                                 <li>First Name: {user.firstName}</li>
                                 <li>Last Name: {user.lastName}</li>
                                 <li>Username: {user.username}</li>
                                 <li>Date Joined: {user.dateJoined}</li>
                                 <li>Role: {user.role}</li>
                                 <li>Privilege: {user.privilege}</li>
                              </ul>

                              <div>
                                 <button onClick={handleUpdateModeToggle}>Edit</button>
                              </div>
                           </>
                  }         
               </>
         }
      </main>
   );
}