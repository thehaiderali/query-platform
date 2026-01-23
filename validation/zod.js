import {z} from "zod"

export const signUpSchema=z.object({
    name:z.string().min(2),
    email:z.email(),
    password:z.string().min(6),
    bio:z.string().optional(),
    role:z.enum(["admin","user"])
})

export const loginSchema=z.object({
    email:z.email(),
    password:z.string().min(6)
})

export const tokenSchema=z.object({
    userId:z.string(),
    role:z.enum(["user","admin"]),
    iat:z.number(),
    exp:z.number(),
})


export const questionSchema=z.object({
    title:z.string().min(10),
    description:z.string().min(20),
    tags:z.array(z.string()).min(1)
})

export const questionUpdate=z.object({
    title:z.string().optional(),
    description:z.string().optional(),
    tags:z.array(z.string()),
    status:z.enum(["open","closed"]).optional()
})

export const answerSchema=z.object({
    content:z.string().min(20)
})

export const agentSchema=z.object({
    agentId:z.string()
})

export const agentCreate=z.object({
    name:z.string(),
    description:z.string(),
    systemPrompt:z.string(),
})
