import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{

  try {

      const user = await User.findById(userId) //finding the user to which we need to set Tokens
      const accessToken =  user.generateAccessToken() //previously built method which generates token
      const refreshToken = user.generateRefreshToken()
      user.refreshToken = refreshToken //setting the user's refresh token object to newly created token
      await user.save({validateBeforeSave:false}) //Mongoose instance method that writes (or updates) the document to your MongoDB database.
      //validate wala is liye false hai kyuunki jab save karte hai to baki fields jaise pass username bhi vapas check karne lagta hai jo hume nahi karwana

      return {accessToken,refreshToken};


  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating Access and Refresh Token")
  }
  
}



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

 //you can also check one by one if they are empty and throw error but for now we are doing like this complex but little
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

 const avatar = await uploadOnCloudinary(avatarLocalPath);
 const coverImage = coverImageLocalPath
   ? await uploadOnCloudinary(coverImageLocalPath):"";

 if(!avatar) {
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
   new ApiResponse(200,createdUser,"User registered successfully")
)

})

  const loginUser = asyncHandler(async(req,res)=>{

    //req.body->data
    //validate username and password format
    //find user? check password : user not exist
    //password correct? generate access and refresh token : error
    //generated? send to cokkies : error

    const {email , username , password} = req.body

    if(!email && !username) //mujhe dono se login karwana hai
    {
      throw new ApiError(400,"Username or password required")
    }

    const user= await User.findOne({
    $or: [{username} , {email}]
})

if(!user)
{
  throw new ApiError(404,"User Does not exists")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid)
{
  throw new ApiError(401,"password is incorrect")
}

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

  //loggedinuser is liye bnaya hai kyuni abhi jo refres token bnaya wo to agya but pehle user se refrnce liya tha to refresh abhi empty hi hai
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  //cokkies
  const options = {
    httpOnly:true,
    secure:true,
  }

  return res.status(200) //thoda 
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(

    new ApiResponse(200,
      {
        user:loggedInUser , accessToken , refreshToken
      },
      "User LoggedIn Successfully"
    )

  )


  })  


const logoutUser = asyncHandler(async(req,res)=>{

  //auth.middleware me naya object bnaya haui to object user mil gya id nikalo aur delete kardo token simple
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{refreshToken: undefined} //req jisme user object bna diya tha auth.middleware me wo aya id nikali aur databse se hata diya refresh tocken ko
    },
    {
      new:true
    }
  )

  const options = {
    httpOnly:true,
    secure:true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options) //data base se hatane ke baad ab current browser cokkies ko bhi clear kardiya
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User LoggedOut Successfully")
  )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

     if(!incomingRefreshToken)
     {
      throw new ApiError(401,"Unauthorized Request")
     }

     try {
      const decodedToken = jwt.verify(  // ye pura object  return karta hai jisme user ki details bhi hoti hai jaise user id
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET,
      )
 
      const user = await User.findById(decodedToken?._id)
 
      if(!user)
      {
       throw new ApiError(401,"Invalid refresh token")
      }
 
      if(incomingRefreshToken !== user?.refreshToken)
      {
       throw new ApiError(401,"Refresh token is expired or used")
      }
 
      const options = {
       httpOnly:true,
       secure:true
      }
 
      const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
 
      res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
       new ApiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access token is refreshed successfully"
       
       )
      )
     } 
     
     catch (error) {
      throw new ApiError(401,"Invalid refresh token")
     }




})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

  const {oldPassword , newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect)
  {
    throw new ApiError(400,"Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
    200,
    {},
    "Password changed successfully")
  )
  
})

const getCurrentUser = asyncHandler(async(req,res)=>{

return res
.status(200)
.json(new ApiResponse(200,req.user,"Current user fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req,res)=>{

const {fullName,email} = req.body

if(!fullName || !email)
{
  throw new ApiError(400,"username and email is required")
}

const user = await User.findByIdAndUpdate( //pehle ek hi update karte the , multiple karna hai to aise karo aur new lagay hai jo updated info return karega
  req.user?._id,
  {
    $set:{
      fullName,   //ES6 syntax (fullName:fullName) same thing
      email:email
    }
  },
  {new:true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(
  200,user,"User details updated successfully"
))

})

const updateUserAvatar = asyncHandler(async (req,res)=>{

  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath)
  {
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url)
  {
    throw new ApiError(400,"Avatar upload failed in cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
      avatar:avatar.url
          }
  } ,
    {
      new:true
    }
  ).select("-password")


return res
.status(200)
.json(new ApiResponse(
  200,user,"avatar updated successfully"
))

})

const updateUsercoverImage = asyncHandler(async (req,res)=>{

  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath)
  {
    throw new ApiError(400,"Cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url)
  {
    throw new ApiError(400,"Cover image upload failed in cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
      coverImage:coverImage.url
          }
  } ,
    {
      new:true
    }
  ).select("-password")


return res
.status(200)
.json(new ApiResponse(
  200,user,"coverImage updated successfully"
))

})


export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUsercoverImage}

