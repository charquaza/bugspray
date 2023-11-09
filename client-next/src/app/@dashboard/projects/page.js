'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function ProjectsPage() {
   const user = useUserData();
   const [projectList, setProjectList] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateProjectList, setUpdateProjectList] = useState(false);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getProjectList() {
      //only run on initial render and 
      //after each successful create call to api
      if (projectList && !updateProjectList) {
         return;
      }

      async function fetchProjectList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
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

   function handleCreateToggle() {
      if (!showCreateForm) {
         //Before rendering create form:
         //initialize inputValues

         //selectedAddMemberId keeps track of <select>.value since
         //'add' button cannot send info about which member is currently selected
         setInputValues({ 
            name: '',
            status: 'open',
            priority: 'high',
            lead: memberList[0]._id,
            team: new Map(),
            selectedAddMemberId: memberList[0]._id
         });
         //reset form errors
         setFormErrors([]);
      }

      setShowCreateForm(prevState => !prevState);
   }

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         //convert team map to array of id's
         fetchBody.team = Array.from(fetchBody.team, ([memberId, member]) => {
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
         var fetchURL = apiURL + '/projects';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            setUpdateProjectList(true);
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

   function handleInputChange(e) {  
      var inputElem = e.target;

      setInputValues(prevState => {
         return { ...prevState, [inputElem.name]: inputElem.value };
      });   
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

   return (
      <main>
         <h1>Projects</h1>

         {
            (user && user.privilege === 'admin') &&
               (
                  showCreateForm 
                     ?
                        <>
                           {
                              formErrors.length > 0 &&
                                 <div>
                                    <p>Project creation unsuccessful: </p>
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
                                 Lead: 
                                 <select 
                                    name='lead' value={inputValues.lead} 
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
                              <button type='submit'>Create</button>
                              <button type='button' 
                                 onClick={handleCreateToggle}
                              >Cancel</button>
                           </form>
                        </>
                     :
                        <button onClick={handleCreateToggle}>Create New Project</button>
               )
         }

         {
            projectList &&
               <ol>
                  {
                     projectList.map((project) => {
                        return (
                           <li key={project._id}>
                              <ul>
                                 <li>Name:&nbsp; 
                                    <Link href={'/projects/' + project._id}>{project.name}</Link>
                                 </li>
                                 <li>Date Created: {project.dateCreated}</li>
                                 <li>Status: {project.status}</li>
                                 <li>Priority: {project.priority}</li>
                                 <li>Lead:&nbsp;
                                    <Link href={'/team/' + project.lead._id}>
                                       {
                                          project.lead.firstName + ' ' +
                                          project.lead.lastName
                                       }
                                    </Link>
                                 </li>
                                 <li>
                                    Team Members: 
                                    <ul>
                                       {
                                          project.team.map((member) => {
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
      </main>
   );
}