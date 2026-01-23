import express from "express"
import authRouter from "./routes/auth.js"
import questionRouter from "./routes/questions.js"
import answerRouter from "./routes/answers.js"
import dotenv from 'dotenv'
import mongoose from "mongoose"
import cors from "cors"
import userRouter from "./routes/user.js"
import { createAgentRouter, getAgentsRouter } from "./routes/agents.js"
import { inngestHandler } from "./inngest/handler.js"

dotenv.config()
const app=express()
app.use(cors())
app.use(express.json())
app.use("/auth",authRouter)
app.use("/questions",questionRouter)
app.use("/answers",answerRouter)
app.use("/users",userRouter)
app.get("/ai-agents",getAgentsRouter);
app.post("/ai-agents",createAgentRouter)
app.use("/api/inngest",inngestHandler)


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