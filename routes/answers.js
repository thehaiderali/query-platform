import { Router } from "express";
import { Answer } from "../models/answer.js";
import { Question } from "../models/question.js";
import { authMiddleware } from "../middleware/middleware.js";
import { answerSchema } from "../validation/zod.js";

const answerRouter=Router()



answerRouter.put("/:id",authMiddleware,async(req,res)=>{
    try {

     const  {success,data}=answerSchema.safeParse(req.body);
      if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
      }  
    const answer=await Answer.findById(req.params.id);
    if(!answer){
        return res.status(400).json({
            success:false,
            error:"Answer not found"
        })
    }
    if(answer.authorId.toString()!==req.user._id.toString()){
        return res.status(403).json({
            success:false,
            error:"Not Authorized"
        })
    }
    const newAnswer=await Answer.findByIdAndUpdate(req.params.id,{
        content:data.content
    },{
        new:true
    })

    return res.status(200).json({
        success:true,
        data:newAnswer
    })
    
    } catch (error) {
        console.log("Error in  Answer Update : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})



answerRouter.delete("/:id",authMiddleware,async(req,res)=>{
    try {

        const answer=await Answer.findById(req.params.id);
    if(!answer){
        return res.status(404).json({
            success:false,
            error:"Answer not found"
        })
    }
    if(answer.authorId.toString()!==req.user._id.toString()){
          return res.status(403).json({
            success:false,
            error:"Not Authorized"
          })      
    }
   const deletedAnswer=await Answer.findByIdAndDelete(req.params.id);
     return res.status(200).json({
        success:true,
        data:{
          message:"Answer deleted successfully"  
        }
     })
        
    } catch (error) {
        console.log("Error in  Answer Update : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})



answerRouter.post("/:id/upvote",authMiddleware,async(req,res)=>{
    try {

    const answer=await Answer.findById(req.params.id);
    if(!answer){
        return res.status(400).json({
            success:false,
            error:"Answer not found"
        })
    }
    let alreadyUpvoter=false
    for( const upvoter of answer.upvoters){
        if(upvoter.toString()===req.user._id.toString()){
            alreadyUpvoter=true
        }
    }
    if(alreadyUpvoter){
        return res.status(409).json({
            success:false,
            error:"Already upvoted this answer"
        })
    }
    let newUpvotes=answer.upvotes;
    newUpvotes+=1;
    let newUpvoters=answer.upvoters;
    newUpvoters.push(req.user._id)
    const newAnswer=await Answer.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:true,
        data:{
            upvotes:newAnswer.upvotes,
            upvoted:true
        }
    })
        
    } catch (error) {
        console.log("Error in Upvoting Answer : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})





answerRouter.delete("/:id/upvote",authMiddleware,async(req,res)=>{
    try {

    const answer=await Answer.findById(req.params.id);
    if(!answer){
        return res.status(400).json({
            success:false,
            error:"Answer not found"
        })
    }
    let alreadyUpvoter=false
    for( const upvoter of answer.upvoters){
        if(upvoter.toString()===req.user._id.toString()){
            alreadyUpvoter=true
        }
    }
    if(!alreadyUpvoter){
        return res.status(409).json({
            success:false,
            error:"Not upvoted this answer"
        })
    }
    let newUpvotes=answer.upvotes;
        newUpvotes-=1;
    let newUpvoters=answer.upvoters.filter((upvoter)=>upvoter.toString()!==req.user._id.toString())
    const newAnswer=await Answer.findByIdAndUpdate(req.params.id,{
        upvotes:newUpvotes,
        upvoters:newUpvoters,
    },{
        new:true
    })
    return res.status(200).json({
        success:true,
        data:{
            upvotes:newAnswer.upvotes,
            upvoted:false
        }
    })
        
    } catch (error) {
        console.log("Error in Deleting Upvote Answer : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})






answerRouter.post("/:id/accept",authMiddleware,async(req,res)=>{
    try {

        const answer= await Answer.findById(req.params.id);
    if(!answer){
        return res.status(404).json({
            success:false,
            error:"Answer not Found"
        })
    }
    const question=await Question.findById(answer.questionId);
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
    const updatedAnswer=await Answer.findByIdAndUpdate(req.params.id,{
        isAccepted:true
    },{
        new:true
    })

    return res.status(200).json({
        success:true,
        data:{
           _id:updatedAnswer._id,
           isAccepted:true,
           message:"Answer marked as accepted" 
        }
    })
        
    } catch (error) {
        console.log("Error in Accepting Answer : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})




export default answerRouter