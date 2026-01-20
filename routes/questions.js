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



questionRouter.post("/questions/:id/upvote",authMiddleware,async(req,res)=>{
    try {

    const question=await Question.findById(req.params.id);
    if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }
    let alreadyUpvoter=false
    for( const upvoter of question.upvoters){
        if(upvoter===req.user._id){
            alreadyUpvoter=true
        }
    }
    if(alreadyUpvoter){
        return res.status(409).json({
            success:false,
            error:"Already upvoted this question"
        })
    }
    let newUpvotes=question.upvotes;
    upvotes+=1;
    let newUpvoters=question.upvoters;
    upvoters.push(req.user._id)
    const newQuestion=await Question.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:false,
        data:{
            upvotes:newQuestion.upvotes,
            upvoted:true
        }
    })
        
    } catch (error) {
        console.log("Error in Upvoting Question : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})


uestionRouter.delete("/questions/:id/upvote",authMiddleware,async(req,res)=>{
    try {

    const question=await Question.findById(req.params.id);
    if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }
    let alreadyUpvoter=false
    for( const upvoter of question.upvoters){
        if(upvoter===req.user._id){
            alreadyUpvoter=true
        }
    }
    if(!alreadyUpvoter){
        return res.status(409).json({
            success:false,
            error:"Not upvoted this question"
        })
    }
    let newUpvotes=question.upvotes;
    upvotes-=1;
    let newUpvoters=question.upvoters.filter((upvoter)=>upvoter!==req.user._id)
    const newQuestion=await Question.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:false,
        data:{
            upvotes:newQuestion.upvotes,
            upvoted:false
        }
    })
        
    } catch (error) {
        console.log("Error in Deleting Upvoting Question : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})






export default questionRouter;


