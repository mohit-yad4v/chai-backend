import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    const pageNumber = parseInt(page)
    const noOfVideosPerPage = parseInt(limit)
    const skipVideos = (pageNumber - 1) * noOfVideosPerPage

    let aggregationPipeline = [
        {
            $match: {
                isPublished: true,
                ...(query && { title: { $regex: query, $options: 'i' } })
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                views: 1
            }
        }
    ];

    try {
        const options = {
            page: pageNumber,
            limit: noOfVideosPerPage
        };

        const videos = await Video.aggregatePaginate(aggregationPipeline, options);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videos.docs,
                    {
                        totalVideos: videos.total,
                        totalPages: videos.pages,
                        currentPage: videos.page,
                        hasNextPage: videos.hasNextPage,
                        hasPrevPage: videos.hasPrevPage
                    },
                    "Videos fetched Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(404, "Something went wrong while fetching videos")
    }


})

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body
    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!title || !description || !videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "All fields and video are required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    let videoDuration = videoFile.audio?.duration || 0


    const video = await Video.create({
        videoFile: videoFile.secure_url,
        title,
        description,
        thumbnail: thumbnail.secure_url,
        duration: videoDuration,
        views: 0,
        isPublished: true,
        owner: req.user._id
    })

    const publishedVideo = await Video.findById(video._id)

    return res.status(201).json(
        new ApiResponse(200, publishedVideo, "Video is published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(400, "Video not found")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video is found Successfully"))

    } catch (error) {
        throw new ApiError(404, "Something went wrong while fetching video")
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, thumbnail: updateThumbnail } = req.body

    const isVideo = await Video.findById(videoId)
    if (!isVideo) {
        throw new ApiError(400, "Video not founded for update")
    }

    if (!title && !description && !updateThumbnail) {
        throw new ApiError(400, "Atleast one of the field is required to update")
    }


    let thumbnail = Video.thumbnail
    if (updateThumbnail) {

        await deleteFromCloudinary(thumbnail, "image")

        const uploadedThumbnail = await uploadOnCloudinary(updateThumbnail)
        thumbnail = uploadedThumbnail.secure_url
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail
            }
        },
        { new: true }


    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video data updated succcessfully")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found for deleting")
    }

    const videoUrl = video.videoFile
    if (videoUrl) {
        await deleteFromCloudinary(videoUrl, "video")
    }

    const thumbnailUrl = video.thumbnail
    if (thumbnailUrl) {
        await deleteFromCloudinary(thumbnailUrl, "image")
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video is successfully deleted")
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video not founded for publishing change")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video publish status changed successfuly")
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}