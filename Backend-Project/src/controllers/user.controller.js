import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uplaodOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res) => {
   
//get user detail from front frontend
//validation : not empty
//check if user already exists or not : email.username
//check fro image and avatar
//upload them to cloudinary , check avatar
//create user object - create entry in db
// remove password and refresh token fieds from response
//check if user is craeted successfully? return res :return error;

//jo bhi data forms ya body se ata hai wo aise lete hai->
 const {fullName , username , email , password } = req.body 
 console.log("email: ", email , fullName , username , password);

 //you can also check one by one if they are epty and throw error but for now we are doing like this complex but little
 if (
   [fullName, username, email, password].some(
     (field) => !field || field.trim() === ""
   )
 ) {
   throw new ApiError(400, "All fields are required");
 }

 const existedUser= await User.findOne({
    $or: [{username} , {email}]
})

if(existedUser)
{
    throw new ApiError(409 , "User Already exists")
}
 
//like expres gives req.body access likewise multer gives req.files access

 const avatarLocalPath = req.files?.avatar[0]?.path; //constional check for if that thing exist then only do it & [0] isliye cuz in object [0]th index pe hota hai full path log karke dekh har ek ek chesse ko

 let coverImageLocalPath ;
 if(req.files &&  Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)    //optional chaining ki hai kyunki agar files hi nahi hai to kya , agar coverimage nahi to kya , agar array ke andar kuch nahi to 
   {
      coverImageLocalPath =  req.files.coverImage[0].path
   } 

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

 const avatar = await uplaodOnCloudinary(avatarLocalPath);
 const coverImage = coverImageLocalPath
   ? await uplaodOnCloudinary(coverImageLocalPath)
   : null;

 if (!avatar) {
   throw new ApiError(400, "Avatar file is required");
 }

 const user = await User.create({
   fullName,
   avatar: avatar.url,
   coverImage : coverImage?.url || "", //kyunki humne kabhi check hi nahi kiya ki cover umage hai bhi ya nahi
   email,
   password,
   username:username.toLowerCase()

})

const createdUser = await User.findById(user._id).select(
   "-password -refreshToken"
) // mongodb creates this if this exists -> user hai nahi to nahi bana user

if(!createdUser)
{
      throw new ApiError(500,"Something went wrong while registering user")

}

return res.status(201).json(
   new ApiResponce(200,createdUser,"User registered succesfully")
)

  
})

export {registerUser}

