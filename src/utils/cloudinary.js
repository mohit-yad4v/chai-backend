import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localeFilePath) => {
    try {
        if (!localeFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localeFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localeFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localeFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }

}

const deleteFromCloudinary = async (fileUrl, fileType) => {

    try {
        if (fileUrl) {
            const filePublicId = fileUrl.split('/').pop().split('.')[0];
            // const filePublicId = fileUrl.split('/').slice(7).join('/').split('.')[0];
            await cloudinary.uploader.destroy(filePublicId, { resource_type: fileType });
        }
    } catch (error) {
        throw new ApiError("Failed to delete")
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}