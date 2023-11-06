'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiURL } from '@/root/config.js';

export default function ProjectsPage() {
    const [projectList, setProjectList] = useState([]);

    useEffect(() => {
        async function getProjectList() {
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
                } else {
                    const errors = data.errors;
                    console.log(errors);
                }
            } catch (err) {
                console.error(err);
            }
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
                            <li key={project._id}>
                                <ul>
                                    <li>Name:&nbsp; 
                                        <Link href={'/projects/' + project._id}>{project.name}</Link>
                                    </li>
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
                            </li>
                        );
                    })
                }
            </ol>
        </main>
    );
}