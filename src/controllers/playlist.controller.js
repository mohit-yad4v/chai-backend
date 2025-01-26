import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    try {
        const newPlayList = new Playlist({
            name,
            description,
            owner: userId,
            videos: []
        })

        await newPlayList.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, newPlayList, "New Playlist created Successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating playlist")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User has no playlist")
    }

    try {
        const userPlaylists = await Playlist.find({
            owner: userId
        })

        if (userPlaylists === 0) {
            return res
                .status(200)
                .json(

                    new ApiResponse(200, userPlaylists, "User Playlist has no playlist")
                )
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, userPlaylists, "User Playlists fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching user playlists")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    try {
        const playList = await Playlist.findById(playlistId)

        if (!playList) {
            throw new ApiError(404, "Playlist not found")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, playList, "User Playlist fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching user playlist")
    }

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const playList = await Playlist.findById(playlistId)

    if (!playList) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (playList.videos.includes(videoId)) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video already exist in the playlist")
            )
    }

    playList.videos.push(videoId)
    const updatedPlayList = await playList.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlayList, "Video added in the playlist")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const playList = await Playlist.findById(playlistId)

    if (!playList) {
        throw new ApiError(404, "Playlist not found")
    }

    const videoIndex = playList.videos.indexOf(videoId)
    if (videoIndex < 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video not found")
            )
    }

    playList.videos.splice(videoIndex, 1);

    const updatedPlayList = await playList.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlayList, "Video removed successfully")
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Playlist is deleted")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    const playList = await Playlist.findById(playlistId)

    if (!name && !description) {
        throw new ApiError(400, "Atleast one field is required ")
    }


    const updatedFields = {
        name: name || playList.name,
        description: description || playList.description
    };

    const updatePlayList = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updatedFields
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatePlayList, "Playlist details updated successfully")
        )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}