'use client'

import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import styles from '@/app/_styles/TaskUpdateForm.module.css';

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

export default function TaskUpdateForm({ taskId, setInUpdateMode, setUpdateTask }) {
   const [task, setTask] = useState();
   const [sprintList, setSprintList] = useState();
   const [filteredSprintList, setFilteredSprintList] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [projectList, setProjectList] = useState(); 

   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/title/i) !== -1) {
            errorMap.set('title', true);
         } else if (errMsg.search(/description/i) !== -1) {
            errorMap.set('description', true);
         } else if (errMsg.search(/project/i) !== -1) {
            errorMap.set('project', true);
         } else if (errMsg.search(/status/i) !== -1) {
            errorMap.set('status', true);
         } else if (errMsg.search(/priority/i) !== -1) {
            errorMap.set('priority', true);
         } else if (errMsg.search(/sprint/i) !== -1) {
            errorMap.set('sprint', true);
         } else if (errMsg.search(/assignees/i) !== -1) {
            errorMap.set('assignees', true);
         }
      });
      return errorMap;
   }, [formErrors]);

   useEffect(function getTask() {
      async function fetchTask() {
         try {
            const fetchOptions = {
               method: 'GET',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/tasks/' + taskId;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const taskData = data.data;
               setTask(taskData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTask();
   }, [taskId]);

   useEffect(function getSprintList() {
      async function fetchSprintList() {
         try {
            const fetchOptions = {
               method: 'GET',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };

            const fetchURL = apiURL + '/sprints';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const sprintListData = data.data;
               //add option to not assign a sprint
               sprintListData.unshift({_id: '', name: '(Not assigned)'});
               setSprintList(sprintListData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchSprintList();
   }, []);

   useEffect(function getAllProjects() {      
      async function fetchProjectList() {
         try {
            const fetchOptions = {
               method: 'GET',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
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
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchProjectList();
   }, []);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         //convert assignees map to array of id's
         fetchBody.assignees = Array.from(fetchBody.assignees, ([memberId, member]) => {
            return memberId;
         });
         delete fetchBody.selectedAddMemberId;

         var fetchOptions = {
            method: 'PUT',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchBody),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         var fetchURL = apiURL + '/tasks/' + task._id;

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setInUpdateMode(false);
            setUpdateTask(true);

            setFormErrors([]); 
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      if (inputElem.name === 'project') {
         let currProject = projectList.find(project => project._id === inputElem.value);

         let currFilteredSprintList = sprintList.filter(
            sprint =>  sprint._id === '' || sprint.project._id === currProject._id 
         );
         setFilteredSprintList(currFilteredSprintList);

         let currMemberList = [ currProject.lead, ...currProject.team ];
         setMemberList(currMemberList);

         let memberListMap = new Map();
         currMemberList.forEach(member => {
            memberListMap.set(member._id, member);
         });
         setMemberMap(memberListMap);

         setInputValues(prevState => { 
            return {
               ...prevState,
               project: currProject._id,
               sprint: currFilteredSprintList[0] ? currFilteredSprintList[0]._id : '(Not assigned)',
               assignees: new Map(),
               selectedAddMemberId: currMemberList[0]._id
            };
         });
      } else {
         setInputValues(prevState => {
            return { ...prevState, [inputElem.name]: inputElem.value };
         }); 
      }  
   }

   function handleAddAssignee(e) {
      setInputValues(prevState => {
         const newMemberId = inputValues.selectedAddMemberId;
         const newMember = memberMap.get(newMemberId);
         const updatedAssignees = new Map(prevState.assignees);
         updatedAssignees.set(newMemberId, newMember);

         //assignees has been updated, so update selectedMemberId
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];
   
            if (!updatedAssignees.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         return { ...prevState, assignees: updatedAssignees, selectedAddMemberId };
      });
   }

   function handleRemoveAssignee(e) {
      setInputValues(prevState => {
         const removedMemberId = e.target.dataset.memberId;
         const updatedAssignees = new Map(prevState.assignees);
         updatedAssignees.delete(removedMemberId);

         //assignees has been updated, so update selectedMemberId
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];
   
            if (!updatedAssignees.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         return { ...prevState, assignees: updatedAssignees, selectedAddMemberId };
      });
   }

   function handleUpdateCancel(e) {
      setInUpdateMode(false);
   }

   //initialize inputValues
   if (!inputValues && task && sprintList && projectList) {
      let currProject = task.project;
      let currFilteredSprintList = sprintList.filter(
         sprint =>  sprint._id === '' || sprint.project._id === currProject._id 
      );
      setFilteredSprintList(currFilteredSprintList);

      let currMemberList = [ currProject.lead, ...currProject.team ];
      setMemberList(currMemberList);

      let memberListMap = new Map();
      currMemberList.forEach(member => {
         memberListMap.set(member._id, member);
      });
      setMemberMap(memberListMap);

      const assigneesList = task.assignees;
      const assigneesMap = new Map();
      assigneesList.forEach(member => {
         assigneesMap.set(member._id, member);
      });

      //selectedAddMemberId keeps track of <select>.value since
      //'add' button cannot send info about which member is currently selected
      let selectedAddMemberId;
      for (const keyValPair of memberListMap) {
         const memberId = keyValPair[0];

         if (!assigneesMap.has(memberId)) {
            selectedAddMemberId = memberId;
            break;
         }
      }

      setInputValues({
         title: task.title,
         description: task.description,
         project: task.project._id,
         status: task.status,
         priority: task.priority,
         sprint: task.sprint ? task.sprint._id : '',
         assignees: assigneesMap,
         selectedAddMemberId
      });
   }

   return (
      <div className={styles['task-update-ctnr']}>
         {(inputValues && task && sprintList && projectList) &&
            <>
               {
                  formErrors.length > 0 &&
                     <div className={styles['error-container']}>
                        <p>Task update unsuccessful: </p>
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
                     type='text' id='title' name='title'
                     required label='Title' variant='filled' 
                     margin='normal' value={inputValues.title}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('title')}
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
                  
                  <CustomTextField 
                     select id='status' name='status'
                     required label='Status' variant='filled' 
                     margin='normal' value={inputValues.status}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('status')}
                     sx={{'maxWidth': '130px'}}
                  >
                     {[
                        <MenuItem key='Open' value='Open'>Open</MenuItem>,
                        <MenuItem key='In Progress' value='In Progress'>In Progress</MenuItem>,
                        <MenuItem key='Complete' value='Complete'>Complete</MenuItem>,
                        <MenuItem key='Closed' value='Closed'>Closed</MenuItem>,
                     ]}
                  </CustomTextField>

                  <CustomTextField 
                     select id='priority' name='priority'
                     required label='Priority' variant='filled' 
                     margin='normal' value={inputValues.priority}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('priority')}
                     sx={{'maxWidth': '130px'}}
                  >
                     {[
                        <MenuItem key='High' value='High'>High</MenuItem>,
                        <MenuItem key='Medium' value='Medium'>Medium</MenuItem>,
                        <MenuItem key='Low' value='Low'>Low</MenuItem>,
                     ]}
                  </CustomTextField>

                  <CustomTextField 
                     select id='sprint' name='sprint'
                     label='Sprint' variant='filled' 
                     margin='normal' value={inputValues.sprint}
                     onChange={handleInputChange}
                     error={inputsWithErrors.has('sprint')}
                     sx={{'maxWidth': '130px'}}
                  >
                     {filteredSprintList && filteredSprintList.map((sprint) => {
                        return (
                           <MenuItem value={sprint._id} key={sprint._id}>
                              {sprint.name}
                           </MenuItem>
                        );
                     }) }
                  </CustomTextField>

                  <div className={styles['assignees-list-ctnr']}>
                     <p className={styles[inputsWithErrors.has('assignees') ? 'assignees-error' : '']}>Assignees:</p> 
                     <ul className={styles['assignees-list'] + ' ' + styles[inputsWithErrors.has('assignees') ? 'assignees-list-error' : '']}>
                        {inputValues.assignees.size > 0
                           ? 
                              Array.from(inputValues.assignees, ([ memberId, member ]) => {
                                 return (
                                    <li key={memberId}>
                                       {`${member.firstName} ${member.lastName} (${member.username})`}
                                       <button type='button' data-member-id={memberId} onClick={handleRemoveAssignee}
                                          className={styles['remove-assignee-btn']}
                                       >Remove</button>
                                    </li>
                                 );
                              }) 
                           : <li className={styles['no-assignees']}>No assignees</li>
                        }
                     </ul>
                  </div>

                  <div className={styles['add-assignee-ctnr']}>
                     <p>Assign Members</p>
                     <CustomTextField 
                        select id='selectedAddMemberId' name='selectedAddMemberId'
                        label='Selected Member' variant='filled' 
                        margin='normal' value={inputValues.selectedAddMemberId || ''}
                        onChange={handleInputChange}
                        disabled={inputValues.assignees.size >= memberMap.size}
                        sx={{'maxWidth': '200px'}}
                     >
                        {memberList && memberList.map((member) => {
                           if (inputValues.assignees.has(member._id)) {
                              return null;
                           }

                           return (
                              <MenuItem value={member._id} key={member._id}>
                                 {`${member.firstName} ${member.lastName} (${member.username})`}
                              </MenuItem>
                           );
                        }) }
                     </CustomTextField>

                     <button type='button' onClick={handleAddAssignee}
                        className={styles['add-assignee-btn']}
                        disabled={inputValues.assignees.size >= memberMap.size}
                     >Add</button>
                  </div>

                  <div className={styles['form-controls-ctnr']}>
                     <button type='submit' className={styles['submit-btn']}>Update</button>
                     <button type='button' className={styles['cancel-btn']}
                        onClick={ handleUpdateCancel }
                     >Cancel</button>
                  </div>
               </form>
            </>   
         }
      </div>
   );
};