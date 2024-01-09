'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function SprintDetailsPage({ params }) {
   const user = useUserData();
   const [sprint, setSprint] = useState();
   const [projectList, setProjectList] = useState(); 

   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   const [updateSprint, setUpdateSprint] = useState(false);
   const [updateProjectList, setUpdateProjectList] = useState(false);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

   useEffect(function getSprint() {
      //only run on initial render and 
      //after each successful update call to api
      if (sprint && !updateSprint) {
         return;
      }

      async function fetchSprint() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/sprints/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const sprintData = data.data;
               setSprint(sprintData);
               setUpdateSprint(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchSprint();
   }, [sprint, updateSprint, params.id]);

   useEffect(function getAllProjects() {  
      //only run on initial render and 
      //after each successful update call to api
      if (projectList && !updateProjectList) {
         return;
      }
      
      async function fetchProjectList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/projects';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const projectListData = data.data;

               setProjectList(projectListData);
               setUpdateProjectList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchProjectList();
   }, [projectList, updateProjectList]);

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
         var fetchURL = apiURL + '/sprints/' + sprint._id;

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateSprint(true);
            setUpdateProjectList(true);
            setFormErrors([]); 
            setInUpdateMode(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleUpdateModeToggle() {
      if (!inUpdateMode) {
         //Before rendering update form:
         //initialize inputValues
         let initialValues = { 
            name: sprint.name,
            description: sprint.description,
            project: sprint.project._id,
            startDate: DateTime.fromISO(sprint.startDate),
            endDate: DateTime.fromISO(sprint.endDate)
         };

         setInputValues(initialValues);

         //reset form errors
         setFormErrors([]);
      }

      setInUpdateMode(prevState => !prevState);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
   }

   async function handleSprintDelete(e) {
      try {
         const fetchOptions = {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         };
         const fetchURL = apiURL + '/sprints/' + sprint._id;

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            router.push('/projects/' + sprint.project._id);
         } else {
            const errors = data.errors;
            //construct new error using error message from server
            setError(new Error(errors[0]));
         }
      } catch (err) {
         setError(err);
      }
   }

   return (
      <main>
         {
            (sprint && projectList && user) &&
               <>
                  <h1>{sprint.name}</h1>
                     {
                        inUpdateMode 
                           ?
                              <>
                                 {
                                    formErrors.length > 0 &&
                                       <div>
                                          <p>Sprint update unsuccessful: </p>
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
                                       Project: 
                                       <select 
                                          name='project' value={inputValues.project} 
                                          onChange={ handleInputChange }
                                       >
                                          { projectList && projectList.map((project) => {
                                             return (
                                                <option value={project._id} key={project._id}>
                                                   {project.name}
                                                </option>
                                             );
                                          }) }
                                       </select>
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
                                    <button type='submit'>Update</button>
                                    <button type='button' 
                                       onClick={handleUpdateModeToggle}
                                    >Cancel</button>
                                 </form>
                              </>
                           :
                              <ul>
                                 <li>Name: {sprint.name}</li>
                                 <li>Description: {sprint.description}</li>
                                 <li>Project:&nbsp;
                                    <Link href={'/projects/' + sprint.project._id}>
                                       {sprint.project.name}
                                    </Link>
                                 </li>
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

                                 <br/>
                                 <div>
                                    <button onClick={handleUpdateModeToggle}>Update Sprint</button>
                                    {
                                       (user.privilege === 'admin') && 
                                          <button onClick={handleSprintDelete}>Delete</button>
                                    }
                                 </div>
                              </ul>
                     }
               </>
         }
      </main>
   );
}