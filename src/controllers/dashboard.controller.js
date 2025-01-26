import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found for getting videos")
    }

    try {
        const totalVideos = await Video.countDocuments({ owner: channelId })

        const totalViews = await Video.aggregate([
            {
                $match: { owner: channelId }
            },
            {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: "$views"
                    }
                }
            }
        ])

        const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

        const totalVideoLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select('_id') } });

        const totalTweetLikes = await Like.countDocuments({ tweet: { $in: await Tweet.find({ owner: channelId }).select('_id') } });

        const totalCommentLikes = await Like.countDocuments({ comment: { $in: await Comment.find({ owner: channelId }).select('_id') } });

        const totalTweets = await Tweet.countDocuments({ owner: channelId });

        const totalComments = await Comment.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select('_id') } });

        const stats = {
            totalVideos,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
            totalSubscribers,
            totalVideoLikes,
            totalTweetLikes,
            totalCommentLikes,
            totalComments,
            totalTweets
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    stats,
                    "Stats fetched successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, "Failed to fetch stats")
    }

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found for getting videos")
    }

    try {
        const allVideos = await Video.find({
            owner: channelId, videoFile: { $ne: null }
        })

        if (allVideos < 1) {
            return res
                .status(200)
                .json(
                    new ApiResponse(200, allVideos, "No videos found")
                )
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, allVideos, "All videos Fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching user's videos")
    }

})

export {
    getChannelStats,
    getChannelVideos
}