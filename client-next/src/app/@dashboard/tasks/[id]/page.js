'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function TaskDetailsPage({ params }) {
   const user = useUserData();
   const [task, setTask] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [projectList, setProjectList] = useState(); 

   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   const [updateTask, setUpdateTask] = useState(false);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [updateProjectList, setUpdateProjectList] = useState(false);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

   useEffect(function getTask() {
      //only run on initial render and 
      //after each successful update call to api
      if (task && !updateTask) {
         return;
      }

      async function fetchTask() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/tasks/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const taskData = data.data;
               setTask(taskData);
               setUpdateTask(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTask();
   }, [task, updateTask, params.id]);

   useEffect(function getAllMembers() {  
      //only run on initial render and 
      //after each successful update call to api
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
            const fetchURL = apiURL + '/members';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const memberListData = data.data;
               const memberListMap = new Map();
               memberListData.forEach(member => {
                  memberListMap.set(member._id, member);
               });

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
   }, [memberList, updateMemberList]);

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
            setUpdateTask(true);
            setUpdateMemberList(true);
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
         const assigneesList = task.assignees;
         const assigneesMap = new Map();
         assigneesList.forEach(member => {
            assigneesMap.set(member._id, member);
         });

         //selectedAddMemberId keeps track of <select>.value since
         //'add' button cannot send info about which member is currently selected
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];

            if (!assigneesMap.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         let initialValues = { 
            title: task.title,
            description: task.description,
            project: task.project._id,
            status: task.status,
            priority: task.priority,
            assignees: assigneesMap,
            selectedAddMemberId
         };

         if (user.privilege === 'admin') {
            initialValues.createdBy = task.createdBy._id;
         }

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

   async function handleTaskDelete(e) {
      try {
         const fetchOptions = {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         };
         const fetchURL = apiURL + '/tasks/' + task._id;

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            router.push('/tasks');
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
            (task && memberList && projectList && user) &&
               <>
                  <h1>{task.title}</h1>
                     {
                        inUpdateMode 
                           ?
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

                                    {
                                       user.privilege === 'admin' &&
                                          <>
                                             <label>
                                                Created By: 
                                                <select 
                                                      name='createdBy' value={inputValues.createdBy} 
                                                      onChange={ handleInputChange }
                                                >
                                                      { memberList && memberList.map((member, index) => {
                                                         return (
                                                            <option value={member._id} key={member._id}>
                                                               {`${member.firstName} ${member.lastName} (${member.username})`}
                                                            </option>
                                                         );
                                                      }) }
                                                </select>
                                             </label>
                                             <br/>
                                          </>
                                    }

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
                                       <button type='button' onClick={handleAddAssignee}>Add</button>
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
                                 <li>Title: {task.title}</li>
                                 <li>Description: {task.description}</li>
                                 <li>Project:&nbsp;
                                    <Link href={'/projects/' + task.project._id}>
                                       {task.project.name}
                                    </Link>
                                 </li>
                                 <li>Date Created: {task.dateCreated}</li>
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

                                 <br/>
                                 <div>
                                    <button onClick={handleUpdateModeToggle}>Update Task</button>
                                    {
                                       (user.privilege === 'admin') && 
                                          <button onClick={handleTaskDelete}>Delete</button>
                                    }
                                 </div>
                              </ul>
                     }
               </>
         }
      </main>
   );
}