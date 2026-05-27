const express = require("express")
const cors = require("cors")
const loginRouter = require("./routes/login.js")
const userRouter = require("./routes/user.js")
const passesRouter = require("./routes/passes.js")
const verificationRouter = require("./routes/verfification.js")

const app = express()
const PORT = 8000

app.use(express.json())
app.use(cors())

app.use('/login', loginRouter)
app.use('/user', userRouter)
app.use('/pass', passesRouter)
app.use('/verification', verificationRouter)

app.get('/', (req, res)=>{
    return res.json({
        message : "IMSEC Hostel Pass Manager API",
        status : "running..."
    }).status(200)
})

app.listen(PORT, ()=>{
    console.log(`App is listening on port ${PORT}`)
})