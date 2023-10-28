'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '../../../../config.js';

export default function TeamPage() {
    const [memberList, setMemberList] = useState([]);

    useEffect(() => {
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
                    setMemberList(memberListData);
                } else {
                    const errors = data.errors;
                    console.log(errors);
                }
            } catch (err) {
                console.error(err);
            }
        }

        getMemberList();
    }, []);

    return (
        <main>
            <h1>Team</h1>
            <p>You are logged in. This is the team page.</p>

            <ol>
                {
                    memberList.map((member) => {
                        return (
                            <li key={member._id}>
                                <ul>
                                    <li>First Name: {member.firstName}</li>
                                    <li>Last Name: {member.lastName}</li>
                                    <li>Username: {member.username}</li>
                                    <li>Date Joined: {member.dateJoined}</li>
                                    <li>Role: {member.role}</li>
                                    <li>Privilege: {member.privilege}</li>
                                </ul>
                            </li>
                        );
                    })
                }
            </ol>

        </main>
    );
}