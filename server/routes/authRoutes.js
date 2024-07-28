import express from 'express'
import { registerUser, userLogin } from '../controllers/authController.js'

const routerAuth=express()

routerAuth.post('/register',registerUser)
routerAuth.post('/login',userLogin)

export default routerAuth