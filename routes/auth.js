import dotenv from "dotenv"
dotenv.config()
import { Router } from "express";
import { signUpSchema, tokenSchema } from "../validation/zod.js";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "../validation/zod.js";
import { authMiddleware } from "../middleware/middleware.js";

const authRouter=Router();

authRouter.post("/signup",async(req,res)=>{
    try {
        
        const {success,data}=signUpSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:"Invalid request schema"
            })
        }
        // Check for Existing Email
        const already=await User.findOne({
            email:data.email
        })
        if(already){
            return res.status(400).json({
                success:false,
                error:"Email already exists"
            })
        }
        // Hash Password
        const hashedpassword=await bcrypt.hash(data.password,10);
        const newUser=await User.create({
            name:data.name,
            email:data.email,
            password:hashedpassword,
            bio:data.bio ? data.bio : "",
            role:data.role
        })
        const response=newUser.toObject();
        delete response.password
        return res.status(201).json({
            success:true,
            data:response
        })

    } catch (error) {
        console.log("Error in Sign Up : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})





authRouter.post("/login",async(req,res)=>{
    try {

     const {success,data}=loginSchema.safeParse(req.body);   
     if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    const already=await User.findOne({
        email:data.email
    })
    if(!already){
        return res.status(404).json({
            success:false,
            error:"Invalid email or password"
        })
    }

    // Check Password

    const isMatch= bcrypt.compare(data.password,already.password)
    if(!isMatch){
        return res.status(404).json({
            success:false,
            error:"Invalid email or password"
        })
    }
    // Generate token

    const token=jwt.sign({
        userId:already._id.toString(),
        role:already.role
    },process.env.JWT_SECRET,{expiresIn:"7d"})

    return res.status(200).json({
        success:true,
        data:{
            token
        }
    })
        
    } catch (error) {
        console.log("Error in Login  : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})




authRouter.get("/me",authMiddleware,async(req,res)=>{
    try {
    const user=req.user.toObject()
    delete user.password
    return res.status(200).json({
        success:true,
        data:user
    })
    } catch (error) {
        console.log("Error in get/me : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})




export default authRouter