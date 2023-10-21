'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '../../../../config.js';

export default function ProjectsPage() {
    const [projectList, setProjectList] = useState([]);

    useEffect(() => {
        async function getProjectList() {
            const fetchOptions = {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                cache: 'no-store'
            };
            const fetchURL = apiURL + '/projects';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();
            const projectListData = data.data;

            setProjectList(projectListData);
        }

        getProjectList();
    }, []);

    return (
        <main>
            <h1>Projects</h1>
            <p>You are logged in. This is the projects page.</p>

            <ol>
                {
                    projectList.map((project) => {
                        return (
                            <li key={project.id}>
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
                                                        <li key={member.id}>
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