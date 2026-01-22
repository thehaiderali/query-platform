import {Router} from "express";
import dotenv from "dotenv"
import { authMiddleware } from "../middleware/middleware.js";
import { answerSchema, questionSchema, questionUpdate } from "../validation/zod.js";
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
        success:true,
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




questionRouter.put("/question/:id",authMiddleware,async(req,res)=>{
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
    if(question.authorId.toString()!==req.user._id.toString()){
        return res.status(403).json({
            success:false,
            error:"Not Authorized"
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




questionRouter.delete("/questions/:id",authMiddleware,async(req,res)=>{
    try {

    const question=await Question.findById(req.params.id);
    if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }
    if(question.authorId.toString()!==req.user._id.toString()){
        return res.status(400).json({
            success:false,
            error:"Not Authorized"
        })
    }
    const deleted=await Question.findByIdAndDelete(req.params.id)
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
        if(upvoter.toString()===req.user._id.toString()){
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
    newUpvotes+=1;
    let newUpvoters=question.upvoters;
    newUpvoters.push(req.user._id)
    const newQuestion=await Question.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:true,
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


questionRouter.delete("/questions/:id/upvote",authMiddleware,async(req,res)=>{
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
        if(upvoter.toString()===req.user._id.toString()){
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
        newUpvotes-=1;
    let newUpvoters=question.upvoters.filter((upvoter)=>upvoter.toString()!==req.user._id.toString())
    const newQuestion=await Question.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:true,
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




questionRouter.post("/questions/:id/answers",authMiddleware,async(req,res)=>{
    try {

      const  {success,data}=answerSchema.safeParse(req.body);
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

    const answer=await Answer.create({
        questionId:question._id,
        authorId:req.user._id,
        content:data.content,
        source:"user",
    })
    
    return res.status(201).json({
        success:true,
        data:answer
    })
    

    } catch (error) {
        console.log("Error in Answer Creation Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})



questionRouter.get("/questions/:id/answers",async(req,res)=>{
    try {
        
      const {sortBy} =req.query;  
      const question=await Question.findById(req.params.id);
      if(!question){
        return res.status(400).json({
            success:false,
            error:"Question not found"
        })
    }  
    let sort = { createdAt: -1 }; // default

    if (sortBy === "recent") {
      sort = { createdAt: -1 };
    }
    
    if (sortBy === "upvotes") {
      sort = { upvotes: -1 };
    }
    
    if (sortBy === "accepted") {
      sort = { isAccepted: -1 };
    }
    
    const answers = await Answer.find({ questionId: question._id })
      .sort(sort);

    return res.status(201).json({
        success:true,
        data:answers
    })
    } catch (error) {
        console.log("Error in Fetching Answers : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})



export default questionRouter;
