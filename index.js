import express from "express"
import authRouter from "./routes/auth.js"
import questionRouter from "./routes/questions.js"
import dotenv from 'dotenv'
import mongoose from "mongoose"
dotenv.config()
const app=express()

app.use(express.json())

app.use("/auth",authRouter)
app.use("/",questionRouter)



const port=process.env.PORT || 3000

app.listen(port,async()=>{
    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("DataBase Connected Sucessfully ")
        
    } catch (error) {
        console.log("DataBase Connection Failed",error)

    }

    console.log("Server Started at PORT : ",port)
})