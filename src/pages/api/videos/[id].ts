import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { connectToMongo } from "@/lib/mongodb";
import { VideoModel } from "@/models/video";
import { deleteCloudinaryAsset } from "@/lib/cloudinary-server";

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

apiRoute.delete(async (req, res) => {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Video ID is required." });
  }

  await connectToMongo();
  const video = await VideoModel.findById(id);
  if (!video) {
    return res.status(404).json({ error: "Video not found." });
  }

  try {
    await deleteCloudinaryAsset(video.publicId);
    await video.deleteOne();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Deletion failed." });
  }
});

export default apiRoute;
