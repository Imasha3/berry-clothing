import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getHomepageSliderItems, updateHomepageSliderItems } from "@/lib/homepage-slider";
import type { HomepageSliderItem } from "@/types/homepage-slider";

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

apiRoute.get(async (_req, res) => {
  const slides = await getHomepageSliderItems();
  res.status(200).json(slides);
});

apiRoute.put(async (req, res) => {
  const payload = req.body as Partial<HomepageSliderItem>[];
  const slides = await updateHomepageSliderItems(payload as HomepageSliderItem[]);
  res.status(200).json(slides);
});

export default apiRoute;
