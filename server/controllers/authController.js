import userModel from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export const userLogin = async (req, res) => {

    try {
        const { username, password } = req.body
        const userExist = await userModel.findOne({ username: username })

        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            })
        }
        const isCorrect = await bcrypt.compare(password, userExist.password)

        if (!isCorrect) {
            return res.status(401).json({
                success: false,
                message: "Wrong credentials"
            })
        }

        const userData={
            user:{
                username:userExist.username,
                email:userExist.email
            }
        }

        const token= jwt.sign(userData,process.env.JWT_SECRET,{ expiresIn: '3d' })
        const userObject = userExist.toObject();
        delete userObject.password;       
         res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: userObject
        })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const registerUser = async (req, res) => {
    const { username, password, email, firstname, lastname } = req.body
    try {
        const doUsernameExist = await userModel.findOne({ username })
        const doEmailExist = await userModel.findOne({ email })

        if (doUsernameExist || doEmailExist) {
            return res.status(409).json({
                success: false,
                message: 'User with the provided credentials already exists.'
            })
        }

        const encryptedPass = await bcrypt.hash(password, 10)

        const newUser = new userModel({
            username,
            password: encryptedPass,
            email,
            firstname,
            lastname
        })

        const savedUser = await newUser.save()

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: savedUser
        })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            success: false,
            message: "Internal server error"
        })
    }
}

