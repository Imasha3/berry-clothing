import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dycqf6xbh";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export async function uploadVideoToCloudinary(filePath: string, filename: string) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "berry-clothing/videos",
    public_id: filename.replace(/\.[^/.]+$/, "")
  });
}

export async function deleteCloudinaryAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}
