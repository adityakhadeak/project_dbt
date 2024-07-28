// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { BASE_URL } from "../helper.js";
import { useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import useSignIn from 'react-auth-kit/hooks/useSignIn';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const signIn = useSignIn()

    const [user, setUser] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const toast = useToast()
    
    const handleLogin = async (username, password) => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        })
        const resJson = await response.json()
        console.log(resJson)

        if (resJson.success) {
            const decodedUser = jwtDecode(resJson.token);
            console.log(decodedUser)
            setUser(decodedUser);
            signIn(
                {
                    auth: {
                        token:resJson.token ,
                        type: 'Bearer'
                    },
                    // refresh: 'ey....mA',
                    userState: {
                        name: resJson.user.firstname,
                        uid: resJson.user._id
                    }
                }
            )
        }
        toast({
            title: resJson.message,
            description: resJson.success ? 'Logged In Successfully' : 'Login failed.',
            status: resJson.success ? 'success' : 'error',
            duration: 5000,
            isClosable: true
        });
        return resJson.success
    }


    return (
        <UserContext.Provider value={{ user, handleLogin, setUser, isLoggedIn, setIsLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
