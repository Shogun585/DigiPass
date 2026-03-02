import express from "express"
import {loginSchema} from "../schemas/zodSchema";
import prisma from "../prisma";
import {verifyPassword} from "../utils/hash";
import {generateToken} from "../utils/token";

const loginRouter = express.Router()

loginRouter.post('/', async(req, res)=>{
    const {username, password} = req.body;

    const {data, success} = loginSchema.safeParse({
        username : username,
        password : password
    })

    if(!success){
        return res.json({
            message : "Invalid inputs"
        }).status(411)
    }

    try{
        const user = await prisma.user.findFirst({
            where : {
                id : username
            },
            select : {
                password : true,
                id : true,
                firstName : true,
                lastName : true,
                role : true
            }
        })

        if(!user){
            return res.json({
                message : "Couldn't find the user"
            }).status(404)
        }else{
            const checkPassword = verifyPassword(password, user.password)

            if(!checkPassword){
                return res.json({
                    message : "Incorrect credentials"
                }).status(404)
            }else {
                const token = generateToken({
                    "sub" : user.id
                })

                return res.json({
                    user_details : {
                        id : user.id,
                        first_name : user.firstName,
                        last_name : user.lastName,
                        role : user.role
                    }
                }).status(200)
            }
        }

    } catch (e) {
        console.error(e)

        res.json({
            message : "an error has occured"
        }).status(404)
    }

})

export default loginRouter