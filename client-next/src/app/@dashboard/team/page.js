'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function TeamPage() {
   const user = useUserData();
   const [memberList, setMemberList] = useState(); 
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function fetchAllMembers() {  
      //only run on initial render and 
      //after each successful create call to api
      if (memberList && !updateMemberList) {
         return;
      }
      
      async function getMemberList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/members';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const memberListData = data.data;

               setMemberList(memberListData);
               setUpdateMemberList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      getMemberList();
   }, [memberList, updateMemberList]);

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
            confirmPassword: '' 
         });
         //reset form errors
         setFormErrors([]);
      }

      setShowCreateForm(prevState => !prevState);
   }

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         const fetchBody = { ...inputValues };

         const fetchOptions = {
            method: 'POST',
            headers: { 
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(fetchBody),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         const fetchURL = apiURL + '/members/sign-up';

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            setUpdateMemberList(true);
            setFormErrors([]); 
            setShowCreateForm(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleInputChange(e) {  
      const inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
   }

   return (
      <main>
         <h1>Team</h1>

         {
            (user && user.privilege === 'admin') &&
               (
                  showCreateForm 
                     ?
                        <>
                           {
                              formErrors.length > 0 &&
                                 <div>
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
                              <button type='submit'>Create</button>
                              <button type='button' 
                                 onClick={handleCreateToggle}
                              >Cancel</button>
                           </form>
                        </>
                     :
                        <button onClick={handleCreateToggle}>Create New Member</button>
               )
         }

         {
            memberList &&
               <ol>
                  {
                     memberList.map((member) => {
                        //don't render self in list
                        if (member._id === user._id) {
                           return null;
                        }

                        return (
                           <li key={member._id}>
                              <ul>
                                 <li>
                                    <Link href={'/team/' + member._id}>
                                       {member.firstName} {member.lastName}
                                    </Link>
                                 </li>
                                 <li>Username: {member.username}</li>
                                 <li>
                                    Date Joined:&nbsp; 
                                    {DateTime.fromISO(member.dateJoined).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                                 </li>
                                 <li>Role: {member.role}</li>
                                 <li>Privilege: {member.privilege}</li>
                              </ul>
                           </li>
                        );
                     })
                  }
               </ol>
         }
      </main>
   );
}