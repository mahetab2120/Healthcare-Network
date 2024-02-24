const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token')

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,16}$/

const authController = { 
    async register(req,res,next) {
       const userRegisterSchema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().min(5).max(15).required(),
        password: Joi.string().pattern(passwordPattern).required(),
        confirmPassword: Joi.ref('password'),
        role: Joi.string().required(),
        profileImage: Joi.string(),
        name: Joi.string().required(),
        specialty: Joi.string(),
        age: Joi.number(),
    });
    const {error} = userRegisterSchema.validate(req.body);

    if(error) {
        return next(error);
    }
    const { profileImage, email, username, password, role, name, specialty, age } = req.body;
    try {
        const emailInUse = await User.exists({ email });
        const usernameInUse = await User.exists({ username });

        if(emailInUse){
            const error = {
                status: 409,
                message: 'Email already in use',
            }
            return next(error);
        }
        if(usernameInUse){
            const error = {
                status: 409,
                message: 'Username already in use',
            }
            return next(error);
        }
    } catch (error) {
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(password,10);
    
    let accessToken;
    let refreshToken;
    let user;
    try {
        const userToRegister = new User({
            username,
            email,
            password: hashedPassword,
            profileImage,
            role
        })
        user = await userToRegister.save();
        accessToken = JWTService.signAccessToken({_id: user._id, username: user.username, email: user.email},'30m')
        refreshToken = JWTService.signRefreshToken({_id: user._id},'60m')
    } catch (error) {
        return next(error)
    }
    
    await JWTService.storeRefreshToken(refreshToken, user._id)
    res.cookie('accessToken',accessToken,{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    })
    res.cookie('refreshToken',refreshToken,{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    })
    
    let userProfile;
    if(role === 'doctor'){
        userProfile = new Doctor({
            userId: user._id,
            name,
            specialty
        })
    } else if(role === 'patient'){
        userProfile = new Patient({
            userId: user._id,
            name,
            age
        });
    }
    const userPro = await userProfile.save();
    res.status(201).json({
        user,
        userPro
    })
    },
    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            role: Joi.string().required(),
            usernameOrEmail: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern)
        })
        const { error } = userLoginSchema.validate(req.body)
        if (error) {
            return next(error)
        }
        const { role, usernameOrEmail, password } = req.body
        let user, userProfile
        try {
            user = await User.findOne({  $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }], })
            if (!user) {
                const error = {
                    status: 401,
                    message: 'Invalid username or password!'
                }
                return next(error)
            }
            if(user.role !== role) {
                const error = {
                    status: 401,
                    message: 'Invalid username or password! role'
                }
                return next(error)
            }
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                const error = {
                    status: 401,
                    message: 'Invalid username or password'
                }
                return next(error)

            }
            
            if (user.role === 'doctor') {
                 userProfile = await Doctor.findOne({ userId: user._id });
            } else if (user.role === 'patient') {
               userProfile = await Patient.findOne({ userId: user._id });
            }
            
        } catch (error) {
            return next(error);
        }

        const accessToken = JWTService.signAccessToken({_id: user._id},'30m')
        const refreshToken = JWTService.signRefreshToken({_id: user._id},'60m')

        try{
            await RefreshToken.updateOne({
                _id:user._id
            },
            {
                token:refreshToken},
                {upsert:true})
        }
        catch(error){
            return next(error)
        }

        res.cookie('accessToken',accessToken,{
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })
       
        res.cookie('refreshToken',refreshToken,{
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })


        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              profile: userProfile,
              // Include any other user-related data you want to return
            },
          });
    }
}

module.exports = authController;