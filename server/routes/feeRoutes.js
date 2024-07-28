import express from 'express'
import { addFee, updateFee } from '../controllers/feeController.js'

const routerFee=express()

routerFee.post('/addfee',addFee)
routerFee.post('/updatefee',updateFee)

export default routerFee