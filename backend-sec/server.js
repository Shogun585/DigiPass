const express = require("express")
const cors = require("cors")
const adminRouter = require("./routes/admin.js")
const loginRouter = require("./routes/login.js")
const userRouter = require("./routes/user.js")
const passesRouter = require("./routes/passes.js")
const verificationRouter = require("./routes/verfification.js")

const app = express()
const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL;
const ORIGIN = process.env.ORIGIN;

app.use(express.json());

app.use((req, res, next)=>{
    res.setHeader('X-Author', 'Abhilash Singh');
    res.setHeader('X-Project-Name', 'ShelfLife');
    next();
});

app.get('/keep-alive', (req, res)=>{
    res.send("Keep alive!!");
})

setInterval(()=>{
    fetch(`${BASE_URL}/keep-alive`)
        .then(()=>console.log("Pinged self to stay alive."))
        .catch((err)=>console.error("Ping failed : ", err))
}, 10 * 60 * 1000);

app.use(cors({
    origin : ORIGIN,
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