import { Box, Button, FormControl, FormLabel, Grid, GridItem, Input, Text, InputRightElement, InputGroup, FormErrorMessage, useConst } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { Link, Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import UserContext from '../context/UserContext.js';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'


const Login = () => {
    const { handleLogin,loading } = useContext(UserContext);
    const navigate = useNavigate()
    const isAuthenticated = useIsAuthenticated()
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }

    }, [isAuthenticated])


    const formik = useFormik({
        initialValues: {
            username: "",
            password: ""
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: Yup.object({
            username: Yup.string().required("Username required").min(6, "Username must be atleast of 6 characters").matches('^[a-zA-Z0-9]+$', 'Username should not contain special characters'),
            password: Yup.string().required('Password Required')
        }),
        onSubmit: async (values, actions) => {
            if (!formik.errors.password && !formik.errors.username) {
                const istrue = await handleLogin(values.username, values.password)
                if (istrue)
                    navigate('/login')
            }
            actions.resetForm()
        }
    })

    const [show, setShow] = useState(false)
    const handleClick = () => setShow(!show)
    const toast = useToast()
    return (
        <Box fontFamily={'Raleway'}   >

            <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <Box height='400px' boxShadow='0px 0px 10px 0px #e5e5e5' rounded='md' bg='white' padding='35px' my='20px' borderRadius='10px'>
                    <Text as='h1' fontSize='30px'>Sign in</Text>
                    <form onSubmit={formik.handleSubmit}>
                        <FormControl isInvalid={formik.errors.username} p='2px' my='5px'>
                            <FormLabel>Username</FormLabel>
                            <Input name='username' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.username} border='1px' borderColor='black' placeholder='Enter Username' py='25px' variant='outline' type='text' />
                            <FormErrorMessage>{formik.errors.username}</FormErrorMessage>

                        </FormControl>
                        <FormControl isInvalid={formik.errors.password} p='2px' my='5px'>
                            <FormLabel>Password</FormLabel>
                            <InputGroup size='md'>
                                <Input
                                    name='password'
                                    onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password}
                                    border='1px' borderColor='black'
                                    py='25px'
                                    pr='4.5rem'
                                    type={show ? 'text' : 'password'}
                                    placeholder='Enter password'
                                />
                                <InputRightElement my='5px' width='4.5rem'>
                                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                                        {show ? 'Hide' : 'Show'}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>

                        </FormControl>
                        <Box display='flex' justifyContent={'center'} alignItems={'center'} width='100%' py='10px' my='20px'>
                            <Button isLoading={loading} width='90%' height='45px' borderRadius='20px' color={'white'} bgColor={'#a41d31'} type='submit'>Sign in</Button>
                        </Box>

                    </form>



                </Box>
            </Box>


        </Box>
    )
}

export default Login
