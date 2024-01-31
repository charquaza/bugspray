'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';

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

   useEffect(function getTask() {
      async function fetchTask() {
         try {
            const fetchOptions = {
               method: 'GET',
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
                  'Content-Type': 'application/json',
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
      <div>
         {
            (inputValues && task && sprintList && projectList) &&
               <>
                  {
                     formErrors.length > 0 &&
                        <div>
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
                     <label>
                        Title:
                        <input 
                           type='text' name='title' value={inputValues.title} 
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
                        Status: 
                        <select 
                           name='status' value={inputValues.status} 
                           onChange={ handleInputChange }
                        >
                           <option value='Open'>Open</option>
                           <option value='In Progress'>In Progress</option>
                           <option value='Complete'>Complete</option>
                           <option value='Closed'>Closed</option>
                        </select>
                     </label>
                     <br/>

                     <label>
                        Priority: 
                        <select 
                           name='priority' value={inputValues.priority} 
                           onChange={ handleInputChange }
                        >
                           <option value='High'>High</option>
                           <option value='Medium'>Medium</option>
                           <option value='Low'>Low</option>
                        </select>
                     </label>
                     <br/>

                     <label>
                        Sprint:
                        <select 
                           name='sprint' value={inputValues.sprint} 
                           onChange={ handleInputChange }
                        >
                           { 
                              filteredSprintList && filteredSprintList.map((sprint) => {
                                 return (
                                    <option value={sprint._id} key={sprint._id}>
                                       {sprint.name}
                                    </option>
                                 );
                              }) 
                           }
                        </select>
                     </label>
                     <br/>

                     Assignees: 
                     <ul>
                        { Array.from(inputValues.assignees, ([ memberId, member ]) => {
                           return (
                              <li key={memberId}>
                                 {`${member.firstName} ${member.lastName} (${member.username})`}
                                 <button type='button' data-member-id={memberId} onClick={handleRemoveAssignee}>Remove</button>
                              </li>
                           );
                        }) }
                     </ul>
                     <label>
                        Assign Members
                        <br/> 
                        <select 
                           name='selectedAddMemberId' value={inputValues.selectedAddMemberId} 
                           onChange={ handleInputChange }
                        >
                           { memberList && memberList.map((member) => {
                              if (inputValues.assignees.has(member._id)) {
                                 return null;
                              }

                              return (
                                 <option value={member._id} key={member._id}>
                                    {`${member.firstName} ${member.lastName} (${member.username})`}
                                 </option>
                              );
                           }) }
                        </select>
                        <button type='button' onClick={handleAddAssignee}
                           disabled={inputValues.assignees.size >= memberMap.size}
                        >Add</button>
                     </label>
                     <br/>

                     <br/>
                     <button type='submit'>Update</button>
                     <button type='button' 
                        onClick={ handleUpdateCancel }
                     >Cancel</button>
                  </form>
               </>   
         }
      </div>
   );
}