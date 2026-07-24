import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dycqf6xbh";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const PRODUCT_FOLDER = "berry-clothing/products";

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

export async function deleteCloudinaryAsset(publicId: string, resourceType: "video" | "image" = "image") {
  assertCloudinaryCredentials();

  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function uploadCloudinaryProductAsset(
  file: Buffer,
  resourceType: "video" | "image" = "image"
) {
  assertCloudinaryCredentials();

  return new Promise<{ secure_url: string; public_id: string; resource_type: string; format: string }>(
    (resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: PRODUCT_FOLDER,
          resource_type: resourceType,
          unique_filename: true
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary did not return an upload result."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format
          });
        }
      );

      upload.end(file);
    }
  );
}

export async function listCloudinaryProductImages() {
  assertCloudinaryCredentials();

  const response = await cloudinary.api.resources({
    type: "upload",
    resource_type: "image",
    prefix: `${PRODUCT_FOLDER}/`,
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
    width?: number;
    height?: number;
  }) => ({
    id: resource.public_id,
    url: resource.secure_url,
    previewUrl: resource.secure_url,
    publicId: resource.public_id,
    alt: resource.display_name || resource.filename || resource.public_id.split("/").pop() || "Berry Clothing product image",
    resourceType: "image" as const,
    createdAt: resource.created_at,
    format: resource.format,
    bytes: resource.bytes,
    width: resource.width,
    height: resource.height
  }));
}
