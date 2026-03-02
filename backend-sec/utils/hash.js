import bcrypt from "bcrypt"

const saltRounds = 10

export const encryptPassword = function (password){
    bcrypt.hash(password, saltRounds, function (err, hash){
        try{
            return hash
        }catch (e) {
            console.error(e)
        }
    })
}

export const verifyPassword = function (plainPassword, hashedPassword) {
    bcrypt.compare(plainPassword, hashedPassword, function (err, result){
        try {
            return result
        }catch (e) {
            console.error(e)
        }
    })
}