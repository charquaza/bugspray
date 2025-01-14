'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';
import styles from '@/app/_styles/sprintDetailsPage.module.css';

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

const CustomDatePicker = styled(DatePicker)({
   'margin': '0 2em 1em 0',
   'width': '140px'
});

export default function SprintDetailsPage({ params }) {
   const user = useUserData();
   const [sprint, setSprint] = useState();
   const [projectList, setProjectList] = useState(); 

   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState(['sdfs']);

   const [updateSprint, setUpdateSprint] = useState(false);
   const [updateProjectList, setUpdateProjectList] = useState(false);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/name/i) !== -1) {
            errorMap.set('name', true);
         } else if (errMsg.search(/description/i) !== -1) {
            errorMap.set('description', true);
         } else if (errMsg.search(/project/i) !== -1) {
            errorMap.set('project', true);
         } else if (errMsg.search(/end date/i) !== -1) {
            errorMap.set('endDate', true);
         } else if (errMsg.search(/start date/i) !== -1) {
            errorMap.set('startDate', true);
         }
      });
      return errorMap;
   }, [formErrors]);

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
      <main className={styles['sprint-details-page']}>
         {(sprint && projectList && user) &&
            <>
               <h1>{sprint.name}</h1>

               {inUpdateMode 
                  ?
                     <>
                        {
                           formErrors.length > 0 &&
                              <div className={styles['error-container']}>
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
                           <CustomTextField 
                              type='text' id='name' name='name'
                              required label='Name' variant='filled' 
                              margin='normal' value={inputValues.name}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('name')}
                           />

                           <div className={styles['description-ctnr']}>
                              <CustomTextField 
                                 type='text' id='description' name='description'
                                 required label='Description' variant='filled' 
                                 multiline maxRows={12}
                                 margin='normal' value={inputValues.description}
                                 onChange={handleInputChange}
                                 error={inputsWithErrors.has('description')}
                                 sx={{
                                    'maxWidth': '600px', 
                                    '& .MuiInputBase-input': {
                                       'paddingTop': '1em'
                                    }
                                 }}
                              />
                           </div>
                           
                           <CustomTextField 
                              select id='project' name='project'
                              required label='Project' variant='filled' 
                              margin='normal' value={inputValues.project}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('project')}
                              sx={{'maxWidth': '200px'}}
                           >
                              {projectList && projectList.map((project) => {
                                 return (
                                    <MenuItem value={project._id} key={project._id}>
                                       {project.name}
                                    </MenuItem>
                                 );
                              }) }
                           </CustomTextField>

                           <div className={styles['date-pickers-ctnr']}>
                              <div>
                                 <p className={styles[inputsWithErrors.has('startDate') ? 'date-error' : '']}>
                                    Start Date
                                 </p>
                                 <CustomDatePicker 
                                    value={inputValues.startDate} 
                                    onChange={ newValue => setInputValues(prevState => {
                                       return { ...prevState, startDate: newValue }
                                    }) }
                                 /> 
                              </div>
                              
                              <div>
                                 <p className={styles[inputsWithErrors.has('endDate') ? 'date-error' : '']}>
                                    End Date
                                 </p>
                                 <CustomDatePicker 
                                    value={inputValues.endDate}
                                    onChange={ newValue => setInputValues(prevState => {
                                       return { ...prevState, endDate: newValue }
                                    }) }
                                 /> 
                              </div>
                           </div>

                           <div className={styles['form-controls-ctnr']}>
                              <button type='submit' className={styles['submit-btn']}>Update</button>
                              <button type='button' className={styles['cancel-btn']}
                                 onClick={handleUpdateModeToggle}
                              >Cancel</button>
                           </div>
                        </form>
                     </>
                  :
                     <>
                        <ul className={styles['sprint-info']}>
                           <li>
                              <span className={styles['label']}>Name:</span> 
                              <span className={styles['info']}>{sprint.name}</span>
                           </li>
                           <li className={styles['description-ctnr']}>
                              <span className={styles['label']}>Description:</span> 
                              <p className={styles['description']}>{sprint.description}</p>
                           </li>
                           <li>
                              <span className={styles['label']}>Project:</span> 
                              <span className={styles['info']}>
                                 <Link href={'/projects/' + sprint.project._id}>
                                    {sprint.project.name}
                                 </Link>
                              </span>
                           </li>
                           <li>
                              <span className={styles['label']}>Start Date:</span> 
                              <span className={styles['info']}>
                                 {
                                    DateTime.fromISO(sprint.startDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                 }
                              </span>
                           </li>
                           <li>
                              <span className={styles['label']}>End Date:</span> 
                              <span className={styles['info']}>
                                 {
                                    DateTime.fromISO(sprint.endDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                 }
                              </span>
                           </li>
                        </ul>

                        <div>
                           <button className={styles['edit-btn']} onClick={handleUpdateModeToggle}>Update Sprint</button>

                           {(user.privilege === 'admin') && 
                              <button className={styles['delete-btn']} onClick={handleSprintDelete}>Delete</button>
                           }
                        </div>
                     </>
               }
            </>
         }
      </main>
   );
};