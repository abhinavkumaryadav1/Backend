import mongoose, {disconnect, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // return plain JS objects and include _id so frontend has a stable id and title
    const allVideos =await Video.find({},{videoFile:1,thumbnail:1,title:1})
    if(!allVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching videos from database")
    }
    // console.log("vid api res :",allVideos);
    
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

    if (!isValidObjectId(videoId)) { // if someone hit endpoint with incorrect id say 1234abcd then it will start searching and make pipeline for this id which does not exist which will mess with the error codes and sabotage it thats why we are checking id and type through this inbuild function 
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    const updatedVideo = video.toObject()
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "video details fetched successfully")
        );

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const user = req.user?._id
    if (!isValidObjectId(user)) {
        throw new ApiError(400, "Invalid UserId");
    }
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId)
    
    if(!video) throw new ApiError(400,"The Requested Video does not exist")

    if(video.owner.toString() !== req.user._id.toString())   
        {
            throw new ApiError(404,"You are not Authorised to make this request")
        } 

        const {title , description} = req.body

        if(!(title && description))
        {
            throw new ApiError(400,"Both Title and Description is required to Proceed")
        }

        const thumbnailLocalPath = req.file?.path
        if (!thumbnailLocalPath) 
        {
        throw new ApiError(400, "thumbnaillll is required");
        }

        const thumbnailToBeDeleted = video.thumbnail.public_id
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!newThumbnail) 
        {
        throw new ApiError(400, "Thumbnail Failed to update ");
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId,{

            $set:{

                    title,
                    description,
                    thumbnail:{
                        public_id:newThumbnail.public_id,
                        url:newThumbnail.url
                    }

                 }

        },{new:true})

                const deleteThumbnail =  await deleteOnCloudinary(thumbnailToBeDeleted)


        if(!updatedVideo)
        {
            throw new ApiError(500,"Failed to Update  the Video")
        }

        return res.status(200).json(new ApiResponse(200,updatedVideo,"Video Updated Successfully"))

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
    getAllVideos,            //partialCompleted
    publishAVideo,          //completed
    getVideoById,          //incomplete
    updateVideo,          //completed
    deleteVideo,         //completed
    togglePublishStatus //completed
}
