import {Router} from "express"
import { User } from "../models/user.js";
import { Question } from "../models/question.js";
import { Answer } from "../models/answer";

const userRouter=Router();




userRouter.get("/users/:id",async(req,res)=>{

    try {
        
    const user=await User.findById(req.params.id).select("-password")
    if(!user){
        return res.status(404).json({
            success:false,
            error:"User not found"
        })
    }    

    return res.status(200).json({
        success:true,
        data:user
    })

    } catch (error) {
        console.log("Error in GET User/id : ",error)
        return res.status(500).json({
            succcess:false,
            error:"Internal Server Error"
        })
    }

})



userRouter.get("/user/:id/questions",async(req,res)=>{
    try {

        const user=await User.findById(req.params.id).select("-password")
        if(!user){
            return res.status(404).json({
                success:false,
                error:"User not found"
            })
        }    

    const {page,limit}=req.query;
    const questions=await Question.find({
        authorId:user._id
    }).limit(limit*1).skip((page-1)*limit) ;
    const count = await Question.countDocuments();
    return res.status(200).json({
        success:true,
        data:{
           questions,
           pagination:{
            page,
            limit,
            totalPages:Math.ceil(count / limit),
            total:count
           } 
        }
    })  

        
    } catch (error) {
        console.log("Error in GET User/id/questions : ",error)
        return res.status(500).json({
            succcess:false,
            error:"Internal Server Error"
        })
    }
})



userRouter.get("/users/:id/answers",async(req,res)=>{

    try {

        const user=await User.findById(req.params.id).select("-password")
        if(!user){
            return res.status(404).json({
                success:false,
                error:"User not found"
            })
        }    

    const {page,limit}=req.query;
    const answers=await Answer.find({
        authorId:user._id
    }).limit(limit*1).skip((page-1)*limit) ;
    const count = await Answer.countDocuments();
    return res.status(200).json({
        success:true,
        data:{
            answers,
           pagination:{
            page,
            limit,
            totalPages:Math.ceil(count / limit),
            total:count
           } 
        }
    })  

        
    } catch (error) {
        console.log("Error in GET User/id/answers : ",error)
        return res.status(500).json({
            succcess:false,
            error:"Internal Server Error"
        })
    }


})