import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import nextConnect from "next-connect";
import {
  listCloudinaryProductImages,
  deleteCloudinaryAsset,
  uploadCloudinaryProductAsset
} from "@/lib/cloudinary-server";

type UploadRequest = NextApiRequest & {
  file?: {
    buffer: Buffer;
    mimetype: string;
  };
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, middleware: ReturnType<typeof upload.single>) {
  return new Promise<void>((resolve, reject) => {
    middleware(req as any, res as any, (error: unknown) => (error ? reject(error) : resolve()));
  });
}

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

apiRoute.get(async (_req, res) => {
  const images = await listCloudinaryProductImages();
  res.status(200).json(images);
});

apiRoute.post(async (req, res) => {
  await runMiddleware(req, res, upload.single("file"));
  const file = (req as UploadRequest).file;

  if (!file) {
    return res.status(400).json({ error: "A product image or video is required." });
  }

  if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
    return res.status(400).json({ error: "Only image and video files can be uploaded." });
  }

  const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";
  const result = await uploadCloudinaryProductAsset(file.buffer, resourceType);
  return res.status(201).json(result);
});

apiRoute.delete(async (req, res) => {
  const publicId = req.query.publicId || req.body.publicId;
  const resourceType = req.query.resourceType || req.body.resourceType || "image";

  if (!publicId || typeof publicId !== "string") {
    return res.status(400).json({ error: "Image public ID is required." });
  }

  if (resourceType !== "image" && resourceType !== "video") {
    return res.status(400).json({ error: "Resource type must be image or video." });
  }

  try {
    const result = await deleteCloudinaryAsset(publicId, resourceType);
    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(400).json({ error: `Cloudinary could not delete this image. Result: ${result.result}` });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Deletion failed." });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false
  }
};
