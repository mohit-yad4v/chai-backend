import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
// import { Video } from "../models/video.model.js"
// import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const pageNumber = parseInt(page)
    const noOfCommentsPerPage = parseInt(limit)
    const skip = (pageNumber - 1) * noOfCommentsPerPage

    try {
        const comments = await Comment.find({ video: videoId })
            .skip(skip)
            .limit(noOfCommentsPerPage)

        const totalComments = await Comment.countDocuments(videoId)
        const totalPages = Math.ceil(totalComments / noOfCommentsPerPage)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        totalComments,
                        totalPages,
                        currentPage: pageNumber,
                        comments
                    }
                )
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching comments")
    }

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params

    if (!content) {
        throw new ApiError(400, "comment should not be empty")
    }
    const video = await Video.findById(videoId)

    try {
        console.log("comment");
        const comment = await Comment.create({
            content,
            video: video._id,
            owner: req.user._id
        })


        const addedComment = await Comment.findById(comment._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, addedComment, "Comment added successfully")
            )

    } catch (error) {
        throw new ApiError(500, "Something went wrong while adding comment")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { commentId } = req.params

    if (!content) {
        throw new ApiError("content should not be empty for updation")
    }

    try {
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content
                }
            },
            { new: true }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "Comment updated successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while Updating the comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    try {
        await Comment.findByIdAndDelete(commentId)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Comment deleted Successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting comment")
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}