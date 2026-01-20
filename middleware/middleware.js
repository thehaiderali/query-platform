import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { tokenSchema } from "../validation/zod.js";
import { User } from "../models/user.js";
dotenv.config()

export async function authMiddleware(req,res,next){
    try {

    const authHeaders=req.headers.authorization;
    if(!authHeaders){
        return res.status(401).json({
            success:false,
            error:"Missing or Invalid Token"
        })
    }
    const token=authHeaders?.split(" ")[1];
    // validate token
    const decodedToken=jwt.decode(token,process.env.JWT_SECRET);
    const {success,data}=tokenSchema.safeParse(decodedToken); 
      if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid token schema"
        })
    }
    const already=await User.findById(data.userId).select("-password");
    if(!already){
        return res.status(404).json({
            success:false,
            error:"Invalid email or password"
        })
    }
    req.user=already
    next()
        
    } catch (error) {
        console.log("Error in Middleware : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

}