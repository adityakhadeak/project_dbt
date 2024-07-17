import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { Outlet } from 'react-router-dom'
// import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const RootLayout = () => {
    return (
        <Grid bgColor='#f4f2ee' height='100vh' templateRows='auto 1fr auto'>
            <GridItem w='100%'>
                <Navbar />
            </GridItem>
            <GridItem >
                <Outlet />
            </GridItem>
           
        </Grid>
    )
}

export default RootLayout