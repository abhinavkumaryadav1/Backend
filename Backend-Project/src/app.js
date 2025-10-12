import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//Routes import

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

//Router declaration
                                    //standard practice for url kuch hai nhi ye api/v1
app.use("/api/v1/user",userRouter) // jaise hi url me /api/v1/user ayega to controle router ke paas jayega aur fir routing wahi se hogi.
                                  //  we can use directly router.get("/register",userregister) but for modularity and big projects we prefer above syntax.

app.use("/api/v1/video",videoRouter)                                  
export {app}