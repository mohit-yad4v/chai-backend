import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found for like")
    }

    const alreadyliked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (alreadyliked) {
        const removedLike = await Like.findByIdAndDelete(alreadyliked._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, removedLike, "Liked id removed from video")
            )
    } else {
        const newLike = await Like({
            video: videoId,
            likedBy: req.user._id
        })

        await newLike.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Liked the video")
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found for like")
    }

    const alreadyliked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (alreadyliked) {
        const removedLike = await Like.findByIdAndDelete(alreadyliked._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, removedLike, "Like id removed from comment")
            )
    } else {
        const newLike = await Like({
            video: commentId,
            likedBy: req.user._id
        })

        await newLike.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Liked the comment")
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found for like")
    }

    const alreadyliked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (alreadyliked) {
        const removedLike = await Like.findByIdAndDelete(alreadyliked._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, removedLike, "Like id removed from tweet")
            )
    } else {
        const newLike = await Like({
            tweet: tweetId,
            likedBy: req.user._id
        })

        await newLike.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Liked the tweet")
            )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(404, "User not found")
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } })
        .populate("video")

    if (likedVideos.length < 1) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, likedVideos, "No liked videos")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "liked videos fetched successfully")
        )


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}