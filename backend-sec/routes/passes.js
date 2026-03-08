import express from "express"
import prisma from "../utils/prisma";

const passesRouter = express.Router()

// todo add user-authentication middleware
passesRouter.post('/', async (req, res)=>{
    let {leaveStart, leaveEnd} = req.body;
    const {passType, id} = req.body;

    if(!leaveStart){
        leaveStart = new Date();
    }
    if(!leaveEnd){
        leaveEnd = new Date();
    }

    // todo add student only pass creation check

    if(passType.toLowerCase() === "market" && leaveStart !== leaveEnd){
        return res.json({
            message : "For market pass the leave start and end should be same"
        }).status(400)
    }

    try{
        const createNewMarketPass = await prisma.leavePass.create({
            data : {
                passType : passType,
                leaveStart : leaveStart,
                leaveEnd : leaveEnd,
                collegeId : id,
                passStatus : "pending"
            }
        })

        return res.json({
            message : "Pass created successfully"
        }).status(200)
    }catch (e){
        console.error(e)

        return res.json({
            message : "an error occurred"
        }).status(400)
    }
})

export default passesRouter