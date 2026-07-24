import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { listCloudinaryProductImages, deleteCloudinaryAsset } from "@/lib/cloudinary-server";

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
