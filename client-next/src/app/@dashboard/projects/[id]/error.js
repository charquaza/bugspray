'use client'

export default function ProjectDetailsError({ error, reset }) {
   return (
      <main>
         <h1>Oops.</h1>
         <p>Something went wrong...</p>
         <p>(Helpful hint: What you seek may no longer be.)</p>
         <p>{ 'Error message: ' + error.message }</p>
         <button onClick={() => reset()}>Click Here to Try Again</button>
      </main>
   );
}