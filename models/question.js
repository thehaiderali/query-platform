import mongoose from "mongoose";

const questionSchema=new mongoose.Schema({

    title:{
        type:String,
        required:true, 
    },
    description:{
        type:String,
        required:true,

    },
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    tags:[{
        type:String
    }],
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
    viewCount:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["open","answered","closed"]
    },


},{timestamps:true})


export const Question=mongoose.model("Question",questionSchema)