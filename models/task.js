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
        required:true
    },
    status:{
        type:String,
        enum:["pending","processing","completed","failed","completed"]
    },
    generatedAnswer:{
        type:String,
    },
    errorMessage:{
        type:String
    }
},{timestamps:true})