import mongoose from "mongoose";


const taskSchema=new mongoose.Schema({
    questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Question"
    },
    agentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AIAgent" 
    },
    inngestEventId:{
        type:String,
    },
    status:{
        type:String,
        enum:["pending","processing","completed","failed"]
    },
    generatedAnswer:{
        type:String,
    },
    errorMessage:{
        type:String
    }
},{timestamps:true})


export const Task=mongoose.model("Task",taskSchema)