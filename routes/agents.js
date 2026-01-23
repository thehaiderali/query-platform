import { Router } from "express";
import { AIAgent } from "../models/agent.js";
import { authMiddleware } from "../middleware/middleware.js";
import { agentCreate } from "../validation/zod.js";


export const getAgentsRouter=Router();

getAgentsRouter.get("/",async(req,res)=>{
      
    try {
        
        const agents=await AIAgent.find();
        if(agents.length===0){
           return res.status(404).json({
               success:false,
               error:"No AI Agents Exist Now"
           })
        }     
        
        return res.status(200).json({
           success:true,
           data:agents
        })
   
       } catch (error) {
           console.log("Error in GET Agents : ",error)
           return res.status(500).json({
               success:false,
               error:"Internal Server Error"
           })
       }
})


export const createAgentRouter=Router();

createAgentRouter.post("/",authMiddleware,async(req,res)=>{
    try {
        const userRole=req.user.role
        if(userRole!=="admin"){
            return res.status(403).json({
                success:false,
                error:"Only Admins Allowed to Create AI Agents"
            })
        }

        const {success,data}=agentCreate.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:"Invalid Schema"
            })
        }
       const newAgent=await AIAgent.create({
        name:data.name,
        description:data.description,
        isActive:true,
        systemPrompt:data.systemPrompt
       })

       return res.status(201).json({
        success:true,
        data:newAgent,
       })
    
    } catch (error) {
        console.log("Error in POST Agents : ",error)
           return res.status(500).json({
               success:false,
               error:"Internal Server Error"
           })
    }

})

