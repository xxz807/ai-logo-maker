"use client"
import React, { useEffect, useState } from 'react'
import Header from './_components/Header'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { UserDetailContext } from './_context/UserDetailContext'

const Provider = ({ children }) => {

    const { user } = useUser();
    const [userDetail, setUserDetail] = useState();

    useEffect(() => {
        user && CheckUserAuth()
    }, [user])


    //saving user data
    const CheckUserAuth = async () => {
        const email = user?.primaryEmailAddress?.emailAddress;
        console.log("-------------user data: " + email);
        const result = await axios.post('/api/users', { useremail: email, username: user.username });
        console.log("-------------user data: " + JSON.stringify(result.data));

        if (!result.data.userEmail) {
            setUserDetail(result.data)
        } else {
            console.error("get user error: either the user is not found or the user is not authenticated: " + JSON.stringify({ useremail: email, username: user.username }));
        }
    }

    return (
        <div>
            <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>

                <Header />
                <div className='px-10 lg:px-32 xl:px-48 2xl:px-56'>
                    {children}

                </div>
            </UserDetailContext.Provider>
        </div>
    )
}

export default Provider

