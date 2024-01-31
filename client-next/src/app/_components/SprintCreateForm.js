'use client'

import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiURL } from '@/root/config.js';

export default function SprintList({ projectId }) {
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [inputValues, setInputValues] = useState();
   const [formErrors, setFormErrors] = useState([]);

   async function handleFormSubmit(e) {
      e.preventDefault();

      try {
         var fetchBody = { ...inputValues };
         fetchBody.project = projectId;

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
         var fetchURL = apiURL + '/sprints';

         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();

         if (res.ok) {
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
      <div>
         {
            showCreateForm 
               ?
                  <>
                     {
                        formErrors.length > 0 &&
                           <div>
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
                           Description:
                           <input 
                              type='text' name='description' value={inputValues.description} 
                              onChange={ handleInputChange }
                           >
                           </input>
                        </label>
                        <br/>

                        <label>
                           Start Date:
                           <DatePicker value={inputValues.startDate} 
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, startDate: newValue }
                              }) } 
                           /> 
                        </label>
                        <br/>

                        <label>
                           End Date:
                           <DatePicker value={inputValues.endDate}
                              onChange={ newValue => setInputValues(prevState => {
                                 return { ...prevState, endDate: newValue }
                              }) } 
                           /> 
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
                  <button onClick={handleCreateToggle}>Create New Sprint</button>
         }
      </div>
   );
}