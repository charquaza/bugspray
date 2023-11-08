'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function MemberDetailsPage({ params }) {
   const user = useUserData();

   const [memberData, setMemberData] = useState();
   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [updateMemberData, setUpdateMemberData] = useState(false);
   const [formErrors, setFormErrors] = useState([]);
   const [deleteErrors, setDeleteErrors] = useState([]);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

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
            username: memberData.username, 
            password: '',
            confirmPassword: '' 
         });
         //reset form errors
         setFormErrors([]);
         setDeleteErrors([]);
      }

      setInUpdateMode(prev => !prev);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
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
      <main>
         { 
            memberData && 
               <>
                  <h1>Member Details</h1>

                  {
                     deleteErrors.length > 0 &&
                        <div>
                           <ul>
                                 {
                                    deleteErrors.map((errMsg) => {
                                       return <li key={errMsg}>{errMsg}</li>;
                                    })
                                 }
                           </ul>
                        </div>

                  }

                  {
                     inUpdateMode 
                        ?
                           <>
                              {
                                 formErrors.length > 0 &&
                                    <div>
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

                                 <br/>
                                 <button type='submit'>Save</button>
                                 <button type='button' 
                                    onClick={handleUpdateModeToggle}
                                 >Cancel</button>
                              </form>
                           </>
                        :
                           <>
                              <ul>
                                 <li>First Name: {memberData.firstName}</li>
                                 <li>Last Name: {memberData.lastName}</li>
                                 <li>Username: {memberData.username}</li>
                                 <li>Date Joined: {memberData.dateJoined}</li>
                                 <li>Role: {memberData.role}</li>
                                 <li>Privilege: {memberData.privilege}</li>
                              </ul>

                              {
                                 (user && user.privilege === 'admin') && 
                                    <div>
                                       <button onClick={handleUpdateModeToggle}>Edit</button>
                                       <button onClick={handleMemberDelete}>Remove</button>
                                    </div>
                              }
                           </>
                  }           
               </>
         }
      </main>
   );
}