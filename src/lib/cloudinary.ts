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
    const url = "/api/product-images";
    const formData = new FormData();

    formData.append("file", file);

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
          const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse & { error?: string };
          if (!response.secure_url) {
            reject(new Error(response.error || "Cloudinary did not return a secure URL."));
            return;
          }
          resolve(response);
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Unable to parse Cloudinary response."));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(response.error || `Cloudinary upload failed with status ${xhr.status}.`));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}.`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("A network error occurred while uploading media."));
    };

    xhr.send(formData);
  });
}
