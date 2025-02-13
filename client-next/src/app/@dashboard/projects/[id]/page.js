'use client'

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';
import SprintList from '@/app/_components/SprintList';
import SprintCreateForm from '@/app/_components/SprintCreateForm';
import TaskList from '@/app/_components/TaskList';
import TaskCreateForm from '@/app/_components/TaskCreateForm';
import styles from '@/app/_styles/projectDetailsPage.module.css';

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

export default function ProjectDetailsPage({ params }) {
   const projectId = use(params).id;

   const user = useUserData();

   const [project, setProject] = useState();
   const [memberList, setMemberList] = useState(); 
   const [memberMap, setMemberMap] = useState();
   const [inUpdateMode, setInUpdateMode] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);
   const [updateProject, setUpdateProject] = useState(false);
   const [updateMemberList, setUpdateMemberList] = useState(false);
   const [updateSprintList, setUpdateSprintList] = useState(false);
   const [updateTaskList, setUpdateTaskList] = useState(false);
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
         } else if (errMsg.search(/status/i) !== -1) {
            errorMap.set('status', true);
         } else if (errMsg.search(/priority/i) !== -1) {
            errorMap.set('priority', true);
         } else if (errMsg.search(/team/i) !== -1) {
            errorMap.set('team', true);
         } else if (errMsg.search(/lead/i) !== -1) {
            errorMap.set('lead', true);
         } else if (errMsg.search(/slack channel id/i) !== -1) {
            errorMap.set('slackChannelId', true);
         }
      });
      return errorMap;
   }, [formErrors]);

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
            const fetchURL = apiURL + '/projects/' + projectId;

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
   }, [project, updateProject, projectId]);

   useEffect(function fetchAllMembers() {  
      //only run on initial render and 
      //after each successful update call to api
      if (memberList && !updateMemberList) {
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
               setUpdateMemberList(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      getMemberList();
   }, [memberList, updateMemberList]);

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
            setUpdateMemberList(true);
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

         //selectedAddMemberId keeps track of <select>.value (not yet added)
         //since 'add' button cannot send info about which member is currently selected
         //selectedAddMemberId must be initialized to the first member that is not in team
         let selectedAddMemberId;
         for (const keyValPair of memberMap) {
            const memberId = keyValPair[0];

            if (!teamMap.has(memberId)) {
               selectedAddMemberId = memberId;
               break;
            }
         }

         setInputValues({ 
            name: project.name,
            status: project.status,
            priority: project.priority,
            lead: project.lead,
            team: teamMap,
            selectedAddMemberId,
            slackChannelId: project.slackChannelId || ''
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
      <main className={styles['project-details-page']}>
         {(project && memberList) && 
            <>
               <h1>{project.name}</h1>

               {inUpdateMode 
                  ?
                     <>
                        {
                           formErrors.length > 0 &&
                              <div className={styles['error-container']}>
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
                              margin='normal' value={inputValues.lead._id}
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

                           <CustomTextField 
                              type='text' id='slackChannelId' name='slackChannelId'
                              label='Slack Channel ID' variant='filled' 
                              margin='normal' value={inputValues.slackChannelId}
                              onChange={handleInputChange}
                              error={inputsWithErrors.has('slackChannelId')}
                           />

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
                              <button type='submit' className={styles['submit-btn']}>Update</button>
                              <button type='button' className={styles['cancel-btn']}
                                 onClick={handleUpdateModeToggle}
                              >Cancel</button>
                           </div>
                        </form>
                     </>
                  :
                     <>
                        <div className={styles['project-info-sprints-ctnr']}>
                           <section className={styles['project-info-controls-ctnr']}>
                              <h2>Project info</h2>

                              <ul className={styles['project-info']}>
                                 <li>
                                    <span className={styles['label']}>Date Created:</span> 
                                    <span className={styles['info']}>
                                       {DateTime.fromISO(project.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                                    </span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Status:</span> 
                                    <span className={styles['info']}>{project.status}</span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Priority:</span> 
                                    <span className={styles['info']}>{project.priority}</span>
                                 </li>

                                 {project.slackChannelId &&
                                    <li>
                                       <span className={styles['label']}>Slack Channel ID:</span> 
                                       <span className={styles['info']}>{project.slackChannelId}</span>
                                    </li>
                                 }
                                 
                                 <li>
                                    <span className={styles['label']}>Lead:</span> 
                                    <span className={styles['info']}>
                                       <Link href={'/team/' + project.lead._id}>
                                       {project.lead.firstName + ' ' + project.lead.lastName}
                                       </Link>
                                    </span>
                                 </li>
                                 <li className={styles['team-list-ctnr']}>
                                    <span className={styles['label']}>Team Members:</span> 
                                    <ul className={styles['team-list']}>
                                       {project.team.map((member) => {
                                          return (
                                             <li key={member._id}>
                                                <Link href={'/team/' + member._id}>
                                                {member.firstName + ' ' + member.lastName}
                                                </Link>
                                             </li>
                                          );
                                       })}
                                    </ul>
                                 </li>
                              </ul>
      
                              {
                                 (user && user.privilege === 'admin') && 
                                    <div>
                                       <button className={styles['edit-btn']} onClick={handleUpdateModeToggle}>
                                          Update
                                       </button>
                                       <button className={styles['delete-btn']} onClick={handleProjectDelete}>
                                          Delete
                                       </button>
                                    </div>
                              }
                           </section>

                           <section className={styles['sprints-ctnr']}>
                              <h2>Sprints</h2>
                              <SprintCreateForm projectId={project._id} 
                                 setUpdateSprintList={setUpdateSprintList} 
                              />
                              <SprintList projectId={project._id} 
                                 updateSprintList={updateSprintList} 
                                 setUpdateSprintList={setUpdateSprintList}
                              />
                           </section>
                        </div>

                        <section className={styles['tasks-ctnr']}>
                           <h2>Tasks</h2>
                           <TaskCreateForm projectId={project._id} 
                              setUpdateTaskList={setUpdateTaskList}
                              shouldUpdateSprintList={updateSprintList} 
                           />
                           <TaskList projectId={project._id}
                              updateTaskList={updateTaskList}
                              setUpdateTaskList={setUpdateTaskList}
                           />
                        </section>
                     </>
               }           
            </>
         }
      </main>
   );
};
