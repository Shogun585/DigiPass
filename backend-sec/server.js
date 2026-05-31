const express = require("express")
const cors = require("cors")
const adminRouter = require("./routes/admin.js")
const loginRouter = require("./routes/login.js")
const userRouter = require("./routes/user.js")
const passesRouter = require("./routes/passes.js")
const verificationRouter = require("./routes/verfification.js")

const app = express()
const PORT = 8000

app.use(express.json())

app.use(cors({
    origin : [
        'http://localhost:3000',
    ],
    credentials : true
}))

app.use('/admin', adminRouter)
app.use('/login', loginRouter)
app.use('/user', userRouter)
app.use('/pass', passesRouter)
app.use('/verify', verificationRouter)

app.get('/', (req, res)=>{
    return res.json({
        message : "IMSEC Hostel Pass Manager API",
        status : "running..."
    }).status(200)
})

app.listen(PORT, '0.0.0.0',  ()=>{
    console.log(`App is listening on port ${PORT}`)
})