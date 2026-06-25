import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dycqf6xbh";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const VIDEO_FOLDER = "berry-clothing/videos";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

function assertCloudinaryCredentials() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary API credentials are not configured.");
  }
}

export async function uploadVideoToCloudinary(filePath: string, filename: string) {
  assertCloudinaryCredentials();

  return cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: VIDEO_FOLDER,
    public_id: filename.replace(/\.[^/.]+$/, "")
  });
}

export async function deleteCloudinaryAsset(publicId: string) {
  assertCloudinaryCredentials();

  return cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}

export async function listCloudinaryVideos() {
  assertCloudinaryCredentials();

  const response = await cloudinary.api.resources({
    type: "upload",
    resource_type: "video",
    prefix: `${VIDEO_FOLDER}/`,
    max_results: 100,
    direction: "desc"
  });

  return response.resources.map((resource: {
    public_id: string;
    secure_url: string;
    created_at: string;
    display_name?: string;
    filename?: string;
    format?: string;
    bytes?: number;
    duration?: number;
  }) => ({
    id: resource.public_id,
    title: resource.display_name || resource.filename || resource.public_id.split("/").pop() || "Fashion video",
    videoUrl: resource.secure_url,
    publicId: resource.public_id,
    createdAt: resource.created_at,
    updatedAt: resource.created_at,
    format: resource.format,
    bytes: resource.bytes,
    duration: resource.duration
  }));
}
