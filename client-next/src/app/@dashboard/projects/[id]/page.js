'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiURL } from '../../../../../config.js';

export default function ProjectDetailsPage({ params }) {
   const [project, setProject] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateProject, setUpdateProject] = useState(false);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

   useEffect(function fetchProjectData() {
      //only run on initial render and 
      //after each successful update call to api
      if (project && !updateProject) {
         return;
      }

      async function getProject() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/projects/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const projectData = data.data;
               setProject(projectData);
               setUpdateProject(false);
            } else {
               const errors = data.errors;
               //construct new error using error message from server
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      getProject();
   });

   useEffect(function fetchAllMembers() {  
      //only run on initial render and 
      //after each successful update call to api
      if (project && !updateProject) {
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
               const memberListMap = new Map();
               memberListData.forEach(member => {
                  memberListMap.set(member._id, member);
               });

               setMemberList(memberListData);
               setMemberMap(memberListMap);
               setUpdateProject(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      getMemberList();
   });

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.lead = fetchBody.lead._id;
         //convert team map to array of id's
         fetchBody.team = Array.from(fetchBody.team, ([memberId, member]) => {
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
         var fetchURL = apiURL + '/projects/' + project._id;

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateProject(true);
            setFormErrors([]); 
            setInUpdateMode(false);
         } else {
            setFormErrors(data.errors);
         }
      } catch (err) {
         setError(err);
      }
   }

   function handleUpdateModeToggle(e) {
      if (!inUpdateMode) {
         //Before rendering update form:

         //initialize inputValues
         const teamList = project.team;
         const teamMap = new Map();
         teamList.forEach(member => {
            teamMap.set(member._id, member);
         });

         //keep track of which team member is currently selected (not yet added)
         //since 'add' button cannot send info about which member is currently selected
         //selectedAddMember must be initialized to the first member that is not in team
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];

            if (!teamMap.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         setInputValues({ 
            ...project, 
            team: teamMap,
            selectedAddMemberId
         });
         //reset form errors
         setFormErrors([]);
      }

      setInUpdateMode(prev => !prev);
   }

   function handleInputChange(e) {  
      var inputElem = e.target;

      if (inputElem.name === 'lead') {
         setInputValues(prevState => {
            return { ...prevState, [inputElem.name]: memberMap.get(inputElem.value) };
         });   
      } else {
         setInputValues(prevState => {
            return { ...prevState, [inputElem.name]: inputElem.value };
         });   
      }
   }

   function handleTeamMemberAdd(e) {
      setInputValues(prevState => {
         const newMemberId = inputValues.selectedAddMemberId;
         const newMember = memberMap.get(newMemberId);
         const updatedTeam = new Map(prevState.team);
         updatedTeam.set(newMemberId, newMember);

         //team has been updated, so update selectedMemberId
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];
   
            if (!updatedTeam.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         return { ...prevState, team: updatedTeam, selectedAddMemberId };
      });
   }

   function handleTeamMemberRemove(e) {
      setInputValues(prevState => {
         const removedMemberId = e.target.dataset.teamMemberId;
         const updatedTeam = new Map(prevState.team);
         updatedTeam.delete(removedMemberId);

         //team has been updated, so update selectedMemberId
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];
   
            if (!updatedTeam.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         return { ...prevState, team: updatedTeam, selectedAddMemberId };
      });
   }

   async function handleProjectDelete(e) {
      try {
         const fetchOptions = {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         };
         const fetchURL = apiURL + '/projects/' + project._id;

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            router.push('/projects');
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
            (project && memberList) && 
               <>
                  <h1>{project.name}</h1>
                  <p>This is the project detail page.</p>

                  {
                     inUpdateMode 
                        ?
                           <>
                              {
                                 formErrors.length > 0 &&
                                    <div>
                                       <p>Project update unsuccessful: </p>
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
                                    Status: 
                                    <select 
                                          name='status' value={inputValues.status} 
                                          onChange={ handleInputChange }
                                    >
                                          <option value='open'>Open</option>
                                          <option value='inProgress'>In Progress</option>
                                          <option value='complete'>Complete</option>
                                          <option value='closed'>Closed</option>
                                    </select>
                                 </label>
                                 <br/>
   
                                 <label>
                                    Priority: 
                                    <select 
                                          name='priority' value={inputValues.priority} 
                                          onChange={ handleInputChange }
                                    >
                                          <option value='high'>High</option>
                                          <option value='medium'>Medium</option>
                                          <option value='low'>Low</option>
                                    </select>
                                 </label>
                                 <br/>
   
                                 <label>
                                    Lead: 
                                    <select 
                                          name='lead' value={inputValues.lead._id} 
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
   
                                 Team Members: 
                                 <ul>
                                    { Array.from(inputValues.team, ([ memberId, member ]) => {
                                       return (
                                          <li key={memberId}>
                                             {`${member.firstName} ${member.lastName} (${member.username})`}
                                             <button type='button' data-team-member-id={memberId} onClick={handleTeamMemberRemove}>Remove</button>
                                          </li>
                                       );
                                    }) }
                                 </ul>
                                 <label>
                                    Add Members
                                    <br/> 
                                    <select 
                                          name='selectedAddMemberId' value={inputValues.selectedAddMemberId} 
                                          onChange={ handleInputChange }
                                    >
                                          { memberList && memberList.map((member, index) => {
                                             if (inputValues.team.has(member._id)) {
                                                return null;
                                             }

                                             return (
                                                <option value={member._id} key={member._id}>
                                                   {`${member.firstName} ${member.lastName} (${member.username})`}
                                                </option>
                                             );
                                          }) }
                                    </select>
                                    <button type='button' onClick={handleTeamMemberAdd}>Add</button>
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
                           <>
                              <ul>
                                 <li>Name: {project.name}</li>
                                 <li>Date Created: {project.dateCreated}</li>
                                 <li>Status: {project.status}</li>
                                 <li>Priority: {project.priority}</li>
                                 <li>Lead: {
                                       project.lead.firstName + ' ' +
                                       project.lead.lastName
                                    }
                                 </li>
                                 <li>
                                    Team Members: 
                                    <ul>
                                       {
                                          project.team.map((member) => {
                                             return (
                                                <li key={member._id}>
                                                   {member.firstName + ' ' + member.lastName}
                                                </li>
                                             );
                                          })
                                       }
                                    </ul>
                                 </li>
                              </ul>

                              <div>
                                 <button onClick={handleUpdateModeToggle}>Update</button>
                                 <button onClick={handleProjectDelete}>Delete</button>
                              </div>
                        </>
                  }           
               </>
         }
      </main>
   );
}