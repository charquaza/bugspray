'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';

export default function TasksPage() {
    const [taskList, setTaskList] = useState([]);

    useEffect(() => {
        async function getTaskList() {
            try {
                const fetchOptions = {
                    method: 'GET',
                    mode:'cors',
                    credentials: 'include',
                    cache: 'no-store'
                };
                const fetchURL = apiURL + '/projects/dummy-project-id/tasks';

                const res = await fetch(fetchURL, fetchOptions);
                const data = await res.json();

                if (res.ok) {
                    const taskListData = data.data;
                    setTaskList(taskListData);
                } else {
                    const errors = data.errors;
                    console.log(errors);
                }
            } catch (err) {
                console.error(err);
            }
        }

        getTaskList();
    }, []);

    return (
        <main>
            <h1>Tasks</h1>
            <p>You are logged in. This is the tasks page.</p>

            <ol>
                {
                    taskList.map((task) => {
                        return (
                            <li key={task._id}>
                                <ul>
                                    <li>Title: {task.title}</li>
                                    <li>Description: {task.description}</li>
                                    <li>Project: {task.project.name}</li>
                                    <li>Date Created: {task.dateCreated}</li>
                                    <li>Created By: {
                                        task.createdBy.firstName + ' ' + 
                                        task.createdBy.lastName
                                        }
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
                                                            {member.firstName + ' ' + member.lastName}
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

        </main>
    );
}