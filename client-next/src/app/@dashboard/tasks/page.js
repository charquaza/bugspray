import TaskCreateForm from '@/app/_components/TaskCreateForm';
import TaskList from '@/app/_components/TaskList';

export default function TasksPage() {
   return (
      <main>
         <h1>Tasks</h1>
         <TaskCreateForm />
         <TaskList />
      </main>
   );
};