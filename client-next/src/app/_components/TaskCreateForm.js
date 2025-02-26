'use client'

import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import styles from '@/app/_styles/TaskCreateForm.module.css';

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

export default function TaskCreateForm({ projectId, setUpdateTaskList, shouldUpdateSprintList }) {
   const [sprintList, setSprintList] = useState();
   const [filteredSprintList, setFilteredSprintList] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [projectList, setProjectList] = useState(); 

   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   const [updateSprintList, setUpdateSprintList] = useState(false);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [updateProjectList, setUpdateProjectList] = useState(false);

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

   useEffect(function getSprintList() {
      //only run on initial render, 
      //after each successful create call to api,
      //or when props.shouldUpdateSprintList is true
      if (sprintList && !updateSprintList && !shouldUpdateSprintList) {
         return;
      }

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

            const fetchURL = (projectId) 
               ? apiURL + '/sprints' + '?projectId=' + projectId
               : apiURL + '/sprints';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const sprintListData = data.data;
               //add option to not assign a sprint
               sprintListData.unshift({_id: '', name: '(Not assigned)'});
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
   }, [sprintList, updateSprintList, projectId, shouldUpdateSprintList]);

   useEffect(function getAllMembers() { 
      //only fetch memberList if projectId is provided

      //only run on initial render and 
      //after each successful create call to api
      if (
         !projectId ||
         memberList && !updateMemberList
      ) {
         return;
      }
       
      async function fetchMemberList() {
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
            const fetchURL = apiURL + '/projects/' + projectId;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const projectData = data.data;
               
               const memberListMap = new Map();
               projectData.team.forEach(member => {
                  memberListMap.set(member._id, member);
               });
               memberListMap.set(projectData.lead._id, projectData.lead);

               const memberListData = Array.from(memberListMap, ([key, value]) => value);

               setMemberList(memberListData);
               setMemberMap(memberListMap);
               setUpdateMemberList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchMemberList();
   }, [memberList, updateMemberList, projectId]);

   useEffect(function getAllProjects() {
      //don't fetch projectList if projectId is provided

      //only run on initial render and 
      //after each successful create call to api
      if (
         projectId ||
         projectList && !updateProjectList
      ) {
         return;
      }
      
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
   }, [projectList, updateProjectList, projectId]);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.project = fetchBody.project || projectId;
         //convert assignees map to array of id's
         fetchBody.assignees = Array.from(fetchBody.assignees, ([memberId, member]) => {
            return memberId;
         });
         delete fetchBody.selectedAddMemberId;

         var fetchOptions = {
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
         var fetchURL = apiURL + '/tasks';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            if (setUpdateTaskList) {
               setUpdateTaskList(true);
            }
            setUpdateSprintList(true);
            setUpdateMemberList(true);
            setUpdateProjectList(true);
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

         if (!projectId) {
            let currProject = projectList[0];
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

            //selectedAddMemberId keeps track of <select>.value since
            //'add' button cannot send info about which member is currently selected
            setInputValues({ 
               title: '',
               description: '',
               project: currProject._id,
               status: 'Open',
               priority: 'High',
               sprint: '',
               assignees: new Map(),
               selectedAddMemberId: currMemberList[0]._id
            });
         } else {
            setInputValues({ 
               title: '',
               description: '',
               status: 'Open',
               priority: 'High',
               sprint: sprintList[0]._id,
               assignees: new Map(),
               selectedAddMemberId: memberList[0]._id
            });
         }

         //reset form errors
         setFormErrors([]);
      }

      setShowCreateForm(prevState => !prevState);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      if (!projectId && inputElem.name === 'project') {
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

   //if user is not part of any projects, do not render form
   if (!projectId && projectList && projectList.length === 0) {
      return null;
   }

   return (
      <div className={styles['task-create-ctnr']}>
         {showCreateForm 
            ?
               <>
                  {
                     formErrors.length > 0 &&
                        <div className={styles['error-container']}>
                           <p>Task creation unsuccessful: </p>
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

                     {projectList &&
                        <CustomTextField 
                           select id='project' name='project'
                           required label='Project' variant='filled' 
                           margin='normal' value={inputValues.project || ''}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('project')}
                           sx={{'maxWidth': '200px'}}
                        >
                           {projectList.map((project) => {
                              return (
                                 <MenuItem value={project._id} key={project._id}>
                                    {project.name}
                                 </MenuItem>
                              );
                           }) }
                        </CustomTextField>
                     }

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
                        {filteredSprintList
                           ? 
                              filteredSprintList.map((sprint) => {
                                 return (
                                    <MenuItem value={sprint._id} key={sprint._id}>
                                       {sprint.name}
                                    </MenuItem>
                                 );
                              })
                           :
                              sprintList.map((sprint) => {
                                 return (
                                    <MenuItem value={sprint._id} key={sprint._id}>
                                       {sprint.name}
                                    </MenuItem>
                                 );
                              }) 
                        }
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

                     <div className={styles['add-assignee-ctnr'] + 
                        (projectId ? ` ${styles['in-project-id-page']}` : '')
                     }>
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
                        <button type='submit' className={styles['submit-btn']}>Create</button>
                        <button type='button' className={styles['cancel-btn']}
                           onClick={ handleCreateToggle }
                        >Cancel</button>
                     </div>
                  </form>
               </>
            :
               <button className={styles['create-btn']} onClick={handleCreateToggle}>Create New Task</button>
         }
      </div>
   );
};