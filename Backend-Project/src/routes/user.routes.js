import {Router} from "express"
import { changeCurrentPassword, getCurrentUser, getUserChanelprofile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage } from "../controllers/user.controller.js"
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

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails) //patch me rakhna hai cuz kuch deatils hi update ho rhi hai sabko change nahi akrna

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUsercoverImage)

router.route("/c/:username").get(verifyJWT,getUserChanelprofile)

router.route("/history").get(verifyJWT,getWatchHistory)



export default router