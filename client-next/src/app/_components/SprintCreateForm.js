'use client'

import { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styles from '@/app/_styles/SprintCreateForm.module.css';

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

const CustomDatePicker = styled(DatePicker)({
   'margin': '0 2em 1em 0',
   'width': '140px'
});

export default function SprintCreateForm({ projectId, setUpdateSprintList }) {
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   const inputsWithErrors = useMemo(() => {
      const errorMap = new Map();
      formErrors.forEach((errMsg) => {
         if (errMsg.search(/name/i) !== -1) {
            errorMap.set('name', true);
         } else if (errMsg.search(/description/i) !== -1) {
            errorMap.set('description', true);
         } else if (errMsg.search(/end date/i) !== -1) {
            errorMap.set('endDate', true);
         } else if (errMsg.search(/start date/i) !== -1) {
            errorMap.set('startDate', true);
         }
      });
      return errorMap;
   }, [formErrors]);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.project = projectId;

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
         var fetchURL = apiURL + '/sprints';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
            if (setUpdateSprintList) {
               setUpdateSprintList(true);
            }
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
         setInputValues({ 
            name: '',
            description: '',
            startDate: null,
            endDate: null
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

   return (
      <div className={styles['sprint-create-form-ctnr']}>
         {showCreateForm 
            ?
               <>
                  {
                     formErrors.length > 0 &&
                        <div className={styles['error-container']}>
                           <p>Sprint creation unsuccessful: </p>
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
                     
                     <div className={styles['date-pickers-ctnr']}>
                        <div>
                           <p className={styles[inputsWithErrors.has('startDate') ? 'date-error' : '']}>
                              Start Date
                           </p>
                           <CustomDatePicker 
                              value={inputValues.startDate} 
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, startDate: newValue }
                              }) }
                           /> 
                        </div>
                        
                        <div>
                           <p className={styles[inputsWithErrors.has('endDate') ? 'date-error' : '']}>
                              End Date
                           </p>
                           <CustomDatePicker 
                              value={inputValues.endDate}
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, endDate: newValue }
                              }) }
                           /> 
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
               <button className={styles['create-btn']} onClick={handleCreateToggle}>Create New Sprint</button>
         }
      </div>
   );
};