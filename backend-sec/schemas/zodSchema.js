import z from "zod"

export const loginSchema = z.object({
    username : z.string(),
    password : z.string()
})

export const signupSchema = z.object({
    id : z.string(),
    password : z.string(),
    firstName : z.string(),
    lastName : z.string(),
    role : z.enum(["student", "warden", "guard", "other"]),
    contactDetails : z.string().optional()
})

export const passCreateShema = z.object({
    passType : z.enum(["market", "leave", "other"]),
    leaveStart : z.date(),
    leaveEnd : z.date()
})