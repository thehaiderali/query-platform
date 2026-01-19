import mongoose from "mongoose";

const answerSchema=new mongoose.Schema({
    questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Question"
    },
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },
    source:{
        type:String,
        enum:["user","ai"]
    },
    aiAgentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AIAgent",
    },
    upvotes:{
        type:Number,
        default:0
    },
    upvoters:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    isAccepted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})