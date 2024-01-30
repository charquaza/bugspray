'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';

export default function TaskCreateForm({ projectId }) {
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
   }, [sprintList, updateSprintList, projectId]);

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
               sprint: currFilteredSprintList[0] ? currFilteredSprintList[0]._id : '(Not assigned)',
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

   return (
      <div>
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

                        {
                           !projectId &&
                              <>
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

                        <label>
                           Sprint:
                           <select 
                              name='sprint' value={inputValues.sprint} 
                              onChange={ handleInputChange }
                           >
                              { 
                                 projectId
                                    ?
                                       sprintList && sprintList.map((sprint) => {
                                          return (
                                             <option value={sprint._id} key={sprint._id}>
                                                {sprint.name}
                                             </option>
                                          );
                                       }) 
                                    :
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
                        <button type='submit'>Create</button>
                        <button type='button' 
                           onClick={handleCreateToggle}
                        >Cancel</button>
                     </form>
                  </>
               :
                  <button onClick={handleCreateToggle}>Create New Task</button>
         }
      </div>
   );
}