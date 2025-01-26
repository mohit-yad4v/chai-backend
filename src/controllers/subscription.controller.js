import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriber = req.user._id

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    if (!(await User.findById(subscriber))) {
        throw new ApiError(404, "Subscriber not found")
    }

    const subscribed = await Subscription.find({
        subscriber,
        channel: channelId
    })

    if (subscribed.length > 0) {
        const unsubscribe = await Subscription.findByIdAndDelete(subscribed[0]._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, unsubscribe, "User unsubscribed the channel")
            )
    } else {
        const subscribe = new Subscription({
            subscriber,
            channel: channelId
        })

        await subscribe.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, subscribe, "Channel is subscribed")
            )
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params


    const userChannelSubscribers = await Subscription.find({
        subscriber: channelId, channel: { $ne: null }
    })
        .populate('subscriber', 'fullName')
        .populate('channel', 'fullName')

    if (userChannelSubscribers.length < 1) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, userChannelSubscribers, "No subscribers found")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, userChannelSubscribers, "Subscribers fetched successfully")
        )


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.find({
        channel: subscriberId, subscriber: { $ne: null }
    })
        .populate('channel', 'fullName')
        .populate('subscriber', 'fullName')                                      

    if (subscribedChannels.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, subscribedChannels, "No subscribed channels found")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}