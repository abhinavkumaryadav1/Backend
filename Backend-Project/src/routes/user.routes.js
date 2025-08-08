import {Router} from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post( //inserted middlware b/w controller passing for img in cloudinary
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser) //controller

router.route("/login").post(loginUser)


//secured rotes

router.route("/logout").post( verifyJWT , logoutUser ) //middleware lagaya hai bech me taki context mil jaye logout method ko ki koun se user ka refresh token hatana hai

router.route("/refresh-token").post(refreshAccessToken)

export default router