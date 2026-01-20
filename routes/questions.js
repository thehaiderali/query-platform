import {Router} from "express";
import dotenv from "dotenv"
import { authMiddleware } from "../middleware/middleware.js";
import { questionSchema, questionUpdate } from "../validation/zod.js";
import { Question } from "../models/question.js";
import { Answer } from "../models/answer.js";

dotenv.config()

const questionRouter=Router();


questionRouter.post("/questions",authMiddleware,async(req,res)=>{
    try {

    const {success,data}=questionSchema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    const newQuestion=await Question.create({
        title:data.title,
        description:data.description,
        tags:data.tags,
        authorId:req.user._id,
    })

    return res.status(201).json({
        success:true,
        data:newQuestion
    })
        
    } catch (error) {
        console.log("Error in Questions Post : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})



questionRouter.get("/questions",async(req,res)=>{
    try {

    const { page,limit}=req.query;
    const questions=await Question.find().limit(limit*1).skip((page-1)*limit)  ;
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
        console.log("Error in Questions Post : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})



questionRouter.get("/questions/:id",async(req,res)=>{
    try {
      
     const question=await Question.findById(req.params.id);
     if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
     }
     const answers = await Answer.find({ questionId: question._id })
     .populate({ path: "authorId", select: "name" }).sort({ createdAt: -1 });

     

     return res.status(200).json({
        data:{
            question,
            answers

        }
     })
    

    } catch (error) {
        console.log("Error in Questions Post : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})




questionRouter.put("/question/:id",async(req,res)=>{
    try {
       
     const {success,data}=questionUpdate.safeParse(req.body);
     if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }  

    const question=await Question.findById(req.params.id);
    if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }

    const newQuestion=await Question.findByIdAndUpdate(req.params.id,{
        $set:data
    },{
        new : true
    })

    return res.status(200).json({
        success:true,
       data:newQuestion
    })

    } catch (error) {
        console.log("Error in Questions Post : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})




questionRouter.delete("/questions/:id",async(req,res)=>{
    try {

    const question=await Question.findById(req.params.id);
    if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }
    await Question.findByIdAndDelete(req.params.id)

    return res.status(200).json({
        success:true,
        data:{
            message:"Question deleted successfully"
        }
    })

        
    } catch (error) {
        console.log("Error in Questions Post : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})




export default questionRouter;


