import express from "express"
import {signupSchema} from "../schemas/zodSchema";
import prisma from "../utils/prisma";
import {encryptPassword} from "../utils/hash";

const userRouter = express.Router()


userRouter.post('/', async (req, res)=>{

    const body = req.body;

    const {success, data} = signupSchema.safeParse(body)

    if(!success){
        return res.json({
            message : "Invalid inputs"
        }).status(411)
    }

    try {
        const user = await prisma.user.findUnique({
            where : {
                id : body.id
            }
        })

        if(user){
            return res.json({
                message : "User already exist"
            }).status(409)
        }else{
            const response = await prisma.user.create({
                data : {
                    id : body.id,
                    password : encryptPassword(body.password),
                    firstName : body.firstName,
                    lastName : body.lastName,
                    role : body.role,
                    contactDetails : body.contactDetails
                }
            })

            return res.json({
                message : "User added successfully!!"
            }).status(200)
        }
    }catch (e) {
        console.error(e)

        return res.json({
            message : "an error occurred"
        }).status(400)
    }
})

export default userRouter