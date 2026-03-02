require('dotenv').config()
import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRE_TIME = `${20}m`
const SECRET_KEY = process.env.SECRET_KEY

export const generateToken = function (data){
    return jwt.sign(data, SECRET_KEY, {expiresIn: ACCESS_TOKEN_EXPIRE_TIME})
}

export const verifyToken = function (token){
    try{
        const payload = jwt.verify(token, SECRET_KEY)
        console.log(payload)
        console.log("add further logic!!!!")
        // TODO add further verification logic
    }catch (e) {
        console.log("add further logic!!!!")
        console.error(e)
    }
}