import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { listCloudinaryProductImages } from "@/lib/cloudinary-server";

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

export default apiRoute;
