import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

//Video Upload and Publish
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if ([title, description].some(
     (field) => !field || field.trim() === "" //.some checks if anyine is not present it returns true
))   {
        throw new ApiError(400, "All fields are required");
     }

     const videoFileLocalPath = req.files?.videoFile[0]?.path
     const thumbnailLocalPath = req.files?.thumbnail[0]?.path

     if(!videoFileLocalPath) throw new ApiError(400,"video File is required")
     if(!thumbnailLocalPath) throw new ApiError(400,"Thumbnail is required for the video")   

     const videoFile = await uploadOnCloudinary(videoFileLocalPath) 
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

     if(!videoFile) throw new ApiError(400,"Video file has not properly uploaded to cloud please upload again")
     if(!thumbnail) throw new ApiError(400,"Thumbnail file has not properly uploaded to cloud please upload again")

    const video = await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration: videoFile?.duration || 0,
        owner:req.user?._id,
        isPublished:true
    })    

    const videoUploaded = await Video.find(video._id) 
    if(!videoUploaded) throw new ApiError(501,"Something went wrong while publishing the video")

        return res.status(201).json(new ApiResponse(201,video,"Video uploaded successfully"))

    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
