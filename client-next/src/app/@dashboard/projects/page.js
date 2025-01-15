'use client'

import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import { useUserData } from '@/app/_hooks/hooks';
import ProjectList from '@/app/_components/ProjectList';
import { apiURL } from '@/root/config.js';
import styles from '@/app/_styles/projectsPage.module.css';

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

export default function ProjectsPage() {
   const user = useUserData();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/name/i) !== -1) {
            errorMap.set('name', true);
         } else if (errMsg.search(/status/i) !== -1) {
            errorMap.set('status', true);
         } else if (errMsg.search(/priority/i) !== -1) {
            errorMap.set('priority', true);
         } else if (errMsg.search(/team/i) !== -1) {
            errorMap.set('team', true);
         } else if (errMsg.search(/lead/i) !== -1) {
            errorMap.set('lead', true);
         }
      });
      return errorMap;
   }, [formErrors]);

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
            status: 'Open',
            priority: 'High',
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
      <main className={styles['projects-page']}>
         <h1>Projects</h1>

         {(user && user.privilege === 'admin') &&
            (showCreateForm 
               ?
                  <>
                     {
                        formErrors.length > 0 &&
                           <div className={styles['error-container']}>
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
                        <CustomTextField 
                           type='text' id='name' name='name'
                           required label='Name' variant='filled' 
                           margin='normal' value={inputValues.name}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('name')}
                        />

                        <div className={styles['status-priority-ctnr']}>
                           <CustomTextField 
                              select id='status' name='status'
                              required label='Status' variant='filled' 
                              margin='normal' value={inputValues.status}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('status')}
                              sx={{'maxWidth': '140px'}}
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
                              sx={{'maxWidth': '140px'}}
                           >
                              {[
                                 <MenuItem key='High' value='High'>High</MenuItem>,
                                 <MenuItem key='Medium' value='Medium'>Medium</MenuItem>,
                                 <MenuItem key='Low' value='Low'>Low</MenuItem>,
                              ]}
                           </CustomTextField>
                        </div>

                        <CustomTextField 
                           select id='lead' name='lead'
                           required label='Lead' variant='filled' 
                           margin='normal' value={inputValues.lead}
                           onChange={handleInputChange}
                           error={inputsWithErrors.has('lead')}
                           sx={{'maxWidth': '200px'}}
                        >
                           { memberList && memberList.map((member, index) => {
                              return (
                                 <MenuItem value={member._id} key={member._id}>
                                    {`${member.firstName} ${member.lastName} (${member.username})`}
                                 </MenuItem>
                              );
                           }) }
                        </CustomTextField>

                        <div className={styles['team-list-add-member-ctnr']}>
                           <div className={styles['team-list-ctnr']}>
                              <p className={styles[inputsWithErrors.has('team') ? 'team-error' : '']}>Team Members:</p> 
                              <ul className={styles['team-list'] + ' ' + styles[inputsWithErrors.has('team') ? 'team-list-error' : '']}>
                                 {inputValues.team.size > 0
                                    ? 
                                       Array.from(inputValues.team, ([ memberId, member ]) => {
                                          return (
                                             <li key={memberId}>
                                                {`${member.firstName} ${member.lastName} (${member.username})`}
                                                <button type='button' data-team-member-id={memberId} onClick={handleTeamMemberRemove}
                                                   className={styles['remove-team-member-btn']}
                                                >Remove</button>
                                             </li>
                                          );
                                       }) 
                                    : <li className={styles['no-team-members']}>No team members</li>
                                 }
                              </ul>
                           </div>

                           <div className={styles['add-team-member-ctnr']}>
                              <p>Add Members</p>
                              <CustomTextField 
                                 select id='selectedAddMemberId' name='selectedAddMemberId'
                                 label='Selected Member' variant='filled' 
                                 margin='normal' value={inputValues.selectedAddMemberId || ''}
                                 onChange={handleInputChange}
                                 disabled={inputValues.team.size >= memberMap.size}
                                 sx={{'maxWidth': '200px'}}
                              >
                                 {memberList && memberList.map((member) => {
                                    if (inputValues.team.has(member._id)) {
                                       return null;
                                    }

                                    return (
                                       <MenuItem value={member._id} key={member._id}>
                                          {`${member.firstName} ${member.lastName} (${member.username})`}
                                       </MenuItem>
                                    );
                                 }) }
                              </CustomTextField>

                              <button type='button' onClick={handleTeamMemberAdd}
                                 className={styles['add-team-member-btn']}
                                 disabled={inputValues.team.size >= memberMap.size}
                              >Add</button>
                           </div>
                        </div>

                        <div className={styles['form-controls-ctnr']}>
                           <button type='submit' className={styles['submit-btn']}>Create</button>
                           <button type='button' className={styles['cancel-btn']}
                              onClick={handleCreateToggle}
                           >Cancel</button>
                        </div>
                     </form>
                  </>
               :
                  <button className={styles['create-btn']} onClick={handleCreateToggle}>Create New Project</button>
            )
         }

         <ProjectList />
      </main>
   );
};