import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

(async function () {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
})();

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        //console.log('File uploaded to Cloudinary successfully ', response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath);
        console.error('Error uploading file to Cloudinary ', err);
        return null;
    }
};

export { uploadOnCloudinary };