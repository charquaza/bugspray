'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiURL } from '@/root/config.js';

export default function SprintList({ projectId }) {
   const [sprintList, setSprintList] = useState();
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateSprintList, setUpdateSprintList] = useState(false);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getSprintList() {
      //only run on initial render and 
      //after each successful create call to api
      if (sprintList && !updateSprintList) {
         return;
      }

      async function fetchSprintList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };

            const queryParams = new URLSearchParams({ projectId });
            const fetchURL = apiURL + '/sprints?' + queryParams;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const sprintListData = data.data;
               setSprintList(sprintListData);
               setUpdateSprintList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchSprintList();
   }, [sprintList, updateSprintList, projectId]);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.project = projectId;

         var fetchOptions = {
            method: 'POST',
            headers: { 
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(fetchBody),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         var fetchURL = apiURL + '/sprints';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateSprintList(true);
            setFormErrors([]); 
            setShowCreateForm(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleCreateToggle() {
      if (!showCreateForm) {
         //Before rendering create form:
         //initialize inputValues
         setInputValues({ 
            name: '',
            description: '',
            startDate: null,
            endDate: null
         });

         //reset form errors
         setFormErrors([]);
      }

      setShowCreateForm(prevState => !prevState);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
   }

   return (
      <section>
         <h2>Sprints</h2>

         {
            showCreateForm 
               ?
                  <>
                     {
                        formErrors.length > 0 &&
                           <div>
                              <p>Sprint creation unsuccessful: </p>
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
                           Name:
                           <input 
                              type='text' name='name' value={inputValues.name} 
                              onChange={ handleInputChange }
                           >
                           </input>
                        </label>
                        <br/>

                        <label>
                           Description:
                           <input 
                              type='text' name='description' value={inputValues.description} 
                              onChange={ handleInputChange }
                           >
                           </input>
                        </label>
                        <br/>

                        <label>
                           Start Date:
                           <DatePicker value={inputValues.startDate} 
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, startDate: newValue }
                              }) } 
                           /> 
                        </label>
                        <br/>

                        <label>
                           End Date:
                           <DatePicker value={inputValues.endDate}
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, endDate: newValue }
                              }) } 
                           /> 
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
                  <button onClick={handleCreateToggle}>Create New Sprint</button>
         }

         {
            sprintList &&
               <ol>
                  {
                     sprintList.map((sprint) => {
                        return (
                           <li key={sprint._id}>
                              <ul>
                                 <li>Name: <Link href={'/sprints/' + sprint._id}>{sprint.name}</Link></li>
                                 <li>Description: {sprint.description}</li>
                                 <li>Start Date:&nbsp;
                                    {
                                       DateTime.fromISO(sprint.startDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                    }
                                 </li>
                                 <li>End Date:&nbsp;
                                    {
                                       DateTime.fromISO(sprint.endDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                    }
                                 </li>
                              </ul>
                           </li>
                        );
                     })
                  }
               </ol>
         }
      </section>
   );
}