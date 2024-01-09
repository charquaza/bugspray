'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { apiURL } from '@/root/config.js';

export default function TaskList({ projectId }) {
   const [taskList, setTaskList] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateTaskList, setUpdateTaskList] = useState(false);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getTaskList() {
      //only run on initial render and 
      //after each successful create call to api
      if (taskList && !updateTaskList) {
         return;
      }

      async function fetchTaskList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };

            const queryParams = new URLSearchParams({ projectId });
            const fetchURL = apiURL + '/tasks?' + queryParams;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const taskListData = data.data;
               setTaskList(taskListData);
               setUpdateTaskList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTaskList();
   }, [taskList, updateTaskList, projectId]);

   useEffect(function getAllMembers() {  
      //only run on initial render and 
      //after each successful create call to api
      if (memberList && !updateMemberList) {
         return;
      }
      
      async function fetchMemberList() {
         try {
            const fetchOptions = {
               method: 'GET',
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

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.project = projectId;
         //convert assignees map to array of id's
         fetchBody.assignees = Array.from(fetchBody.assignees, ([memberId, member]) => {
            return memberId;
         });
         delete fetchBody.selectedAddMemberId;

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
         var fetchURL = apiURL + '/tasks';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateTaskList(true);
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

   function handleCreateToggle() {
      if (!showCreateForm) {
         //Before rendering create form:
         //initialize inputValues

         //selectedAddMemberId keeps track of <select>.value since
         //'add' button cannot send info about which member is currently selected
         setInputValues({ 
            title: '',
            description: '',
            status: 'Open',
            priority: 'High',
            sprint: '',
            assignees: new Map(),
            selectedAddMemberId: memberList[0]._id
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

   return (
      <section>
         <h2>Tasks</h2>

         {
            showCreateForm 
               ?
                  <>
                     {
                        formErrors.length > 0 &&
                           <div>
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
                           <input 
                              type='number' name='sprint' value={inputValues.sprint} 
                              onChange={ handleInputChange }
                           >
                           </input>
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
                        <button type='submit'>Create</button>
                        <button type='button' 
                           onClick={handleCreateToggle}
                        >Cancel</button>
                     </form>
                  </>
               :
                  <button onClick={handleCreateToggle}>Create New Task</button>
         }

         {
            taskList &&
               <ol>
                  {
                     taskList.map((task) => {
                        return (
                           <li key={task._id}>
                              <ul>
                                 <li>Title: <Link href={'/tasks/' + task._id}>{task.title}</Link></li>
                                 <li>Description: {task.description}</li>
                                 <li>Project:&nbsp;
                                    <Link href={'/projects/' + task.project._id}>
                                       {task.project.name}
                                    </Link>
                                 </li>
                                 <li>Date Created:&nbsp;
                                    {
                                       DateTime.fromISO(task.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                    }
                                 </li>
                                 <li>Created By:&nbsp;
                                    <Link href={'/team/' + task.createdBy._id}>
                                       {
                                          task.createdBy.firstName + ' ' + 
                                          task.createdBy.lastName
                                       }
                                    </Link>
                                 </li>
                                 <li>Status: {task.status}</li>
                                 <li>Priority: {task.priority}</li>
                                 <li>Sprint: {task.sprint || 'N/A'}</li>
                                 <li>
                                    Assignees: 
                                    <ul>
                                       {
                                          task.assignees.map((member) => {
                                             return (
                                                <li key={member._id}>
                                                   <Link href={'/team/' + member._id}>
                                                      {member.firstName + ' ' + member.lastName}
                                                   </Link>                                                
                                                </li>
                                             );
                                          })
                                       }
                                    </ul>
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