import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { connectToMongo } from "@/lib/mongodb";
import { StoreSettingsModel } from "@/models/storeSettings";
import type { StoreSettings } from "@/types/settings";

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

apiRoute.get(async (_req, res) => {
  await connectToMongo();
  const settings = await StoreSettingsModel.findOne().lean();

  if (!settings) {
    return res.status(200).json({
      storeName: "Berry Clothing",
      logo: "Berry",
      description: "A modern Sri Lankan women’s fashion label bringing social-selling energy into a polished online shopping experience.",
      contactEmail: "hello@berryclothing.lk",
      contactPhone: "+94 77 123 4567",
      address: "Colombo, Sri Lanka",
      footerText: "Crafted with care for stylish women in Sri Lanka.",
      socialLinks: {
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: ""
      },
      bankDetails: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        branch: ""
      },
      returnPolicy: "",
      exchangePolicy: ""
    });
  }

  res.status(200).json(settings);
});

apiRoute.put(async (req, res) => {
  const payload = req.body as Partial<StoreSettings>;

  if (!payload.storeName || typeof payload.storeName !== "string") {
    return res.status(400).json({ error: "Store name is required." });
  }

  await connectToMongo();

  const settings = await StoreSettingsModel.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }).lean();

  res.status(200).json(settings);
});

export default apiRoute;
