import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const allVideos = await Video.find({},{videoFile:1,thumbnail:1,_id:0})
    if(!allVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching videos from database")
    }

    return res.status(200).json(new ApiResponse(200,allVideos,"All videos feathed successfully"))
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
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {                                            
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
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
    const video = await Video.findById(videoId)
    if(!video) 
        {
            throw new ApiError(404,"Video not found that has to be deleted")
        }

    if( video?.owner.toString()  !==req.user?._id.toString())
        {
            throw new ApiError(404,"You are not Authorised to Delete this Asset")
        }

    const videoDeleted = await Video.findByIdAndDelete(video._id)

    if(!videoDeleted)
    {
        throw new ApiError(500,"Something went wrong while Deleting the Asset")
    }

    await deleteOnCloudinary(video.thumbnail.public_id)
    await deleteOnCloudinary(video.videoFile.public_id,"video")

    return res.status(200).json(new ApiResponse(200,{},"Asset Deleted Succeccfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        { new: true }
    );

    if (!toggledVideoPublish) {
        throw new ApiError(500, "Failed to toogle video publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggledVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
