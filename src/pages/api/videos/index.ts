import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import multer from "multer";
import { listCloudinaryVideos, uploadBufferToCloudinary } from "@/lib/cloudinary-server";

interface VideoUploadRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 250 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      cb(new Error("Only video files are allowed."));
      return;
    }
    cb(null, true);
  }
});

const apiRoute = nextConnect<VideoUploadRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

apiRoute.use(upload.single("video"));

apiRoute.get(async (_req, res) => {
  const videos = await listCloudinaryVideos();
  res.status(200).json(videos);
});

apiRoute.post(async (req, res) => {
  const title = req.body.title?.toString().trim();
  const file = req.file;

  if (!title || !file) {
    return res.status(400).json({ error: "Title and video file are required." });
  }

  try {
    // upload directly from memory buffer to Cloudinary
    const filename = file.originalname || `upload-${Date.now()}`;
    const uploadResponse = await uploadBufferToCloudinary(file.buffer as Buffer, filename, "video");

    const video = {
      id: uploadResponse.public_id,
      title,
      videoUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      createdAt: uploadResponse.created_at ?? new Date().toISOString(),
      updatedAt: uploadResponse.created_at ?? new Date().toISOString()
    };

    return res.status(201).json(video);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Upload failed." });
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default apiRoute;
