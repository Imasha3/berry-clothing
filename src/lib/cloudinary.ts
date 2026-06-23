const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dycqf6xbh";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "berry-clothing";

export interface CloudinaryUploadResponse {
  secure_url: string;
  resource_type: string;
  format: string;
  public_id: string;
}

export type UploadProgressCallback = (progress: number) => void;

export function uploadCloudinaryAsset(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "berry-clothing/products");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
          if (!response.secure_url) {
            reject(new Error("Cloudinary did not return a secure URL."));
            return;
          }
          resolve(response);
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Unable to parse Cloudinary response."));
        }
      } else {
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("A network error occurred while uploading media."));
    };

    xhr.send(formData);
  });
}
