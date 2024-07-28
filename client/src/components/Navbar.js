import { Box, Button, Image, Input, InputGroup, InputLeftElement, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Text } from '@chakra-ui/react';
import React, { useContext, useRef, useState } from 'react';
import logo from '../images/pcelogo.png'
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'

const Navbar = () => {
    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut()
    const navigate = useNavigate()

    const logout = () => {
        console.log('hiiii')
        signOut()
        navigate("/login")
    }

    return (
        <Box fontFamily={'Raleway'} backgroundColor={'#ffffff'}>
            <Box padding={'10px'} display={{ base: 'none', md: 'block' }}>

                <Box display={'flex'} justifyContent={'space-between'} flexDirection={'row'} alignItems={'center'}>
                    <Box flexBasis={'10%'}>
                        <Box fontSize={'40px'} fontWeight={'700'} px={'10px'}>
                            <Image width={'60px'} src={logo} />
                        </Box>
                    </Box>

                    <Box flexBasis={'25%'} display={'flex'} gap={6} flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
                        {!isAuthenticated ? (
                            <Box padding={'10px'}>
                                <Button as={Link} to={'/login'} _hover={{ bgColor: '#1b3058' }} rounded={8} fontSize={'17px'} color={'white'} fontWeight={700} padding={'20px'} py={'25px'} bgColor={'#a41d31'}>Login</Button>
                            </Box>
                        ) : (
                            <Box Box padding={'10px'}>
                                <Button onClick={logout} _hover={{ bgColor: '#1b3058' }} rounded={8} fontSize={'17px'} color={'white'} fontWeight={700} padding={'20px'} py={'25px'} bgColor={'#a41d31'}>Log out</Button>
                            </Box>
                        )
                        }

                    </Box>
                </Box>

            </Box>
            {/* //mobile view */}
            <Box display={{ base: 'block', md: 'none' }}>
            </Box>
        </Box >
    );
}

export default Navbar;
