import express from "express"
import cors from "cors"
import loginRouter from "./routes/login";
import userRouter from "./routes/user";
import passesRouter from "./routes/passes";
import verificationRouter from "./routes/verfification";

const app = express()
const PORT = 8000

app.use(express.json())
app.use(cors())

app.use('/login', loginRouter)
app.use('/user', userRouter)
app.use('/pass', passesRouter)
app.use('/verification', verificationRouter)

app.listen(PORT, ()=>{
    console.log(`App is listening on port ${PORT}`)
})