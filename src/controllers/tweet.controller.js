import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    try {
        const tweet = await Tweet.create({
            content,
            owner: req.user._id
        })
        console.log("tweet");

        const savedTweet = await Tweet.findById(tweet._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, savedTweet, "Tweet created successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!(await User.findById(userId))) {
        throw new ApiError(404, "User not found for fetching tweets")
    }

    try {
        const tweets = await Tweet.find({ owner: userId })

        if (tweets.length == 0) {
            throw new ApiError(404, "no tweets found ")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, tweets, "User's tweets fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching user's tweets")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "New Tweet is required")
    }


    try {
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set: {
                    content: content
                }
            },
            { new: true }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, tweet, "Tweet updated succcessfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating tweet")
    }


})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    try {
        await Tweet.findByIdAndDelete(tweetId)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Tweet is successfully deleted")
            )
    } catch (error) {
        throw new ApiError("Something went wrong while deleting tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}