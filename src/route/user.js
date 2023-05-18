const express = require('express')
const userRouter = express.Router()

const { generateOTP , createUser , login} = require('../controller/user')

userRouter.post('/create', createUser)
userRouter.post('/login', login)
userRouter.post('/otp', generateOTP)

// userRouter.post('/signIn', verifySignIn)


module.exports = userRouter
