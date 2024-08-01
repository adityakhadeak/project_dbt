import express, { urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectToDB from './db/database.js'
import routerAuth from './routes/authRoutes.js'
import routerFee from './routes/feeRoutes.js'
dotenv.config()
const app = express()
const __dirname=path.resolve()

app.use(express.json())

app.use(cors())

app.use('/api/auth',routerAuth)
app.use('/api/fee',routerFee)

app.use(express.static(path.join(__dirname,"/client/build")))

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"client","build","index.html"))
})


connectToDB()

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server connected on port ${port}`)

})