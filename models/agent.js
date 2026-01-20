import mongoose from "mongoose";

const agentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    systemPrompt:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    tasksCompleted:{
        type:Number,
        default:0
    }
},{timestamps:true})

export const AIAgent=mongoose.model("AIAgent",agentSchema)