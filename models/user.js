import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        required:true
    },
    bio:{
        type:String, 
    },
    avatar:{
        type:String
    },
    questionsCount:{
        type:Number,
        required:true,
        default:0
    },
    answersCount:{
        type:Number,
        required:true,
        default:0
    }
},{timestamps:true})


export const User=mongoose.model("User",userSchema)