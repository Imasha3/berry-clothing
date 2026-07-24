import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getStoreSettings, updateStoreSettings } from "@/lib/settings-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { StoreSettings } from "@/types/settings";

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error." });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed." });
  }
});

function getAccessToken(req: NextApiRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

apiRoute.get(async (req, res) => {
  const settings = await getStoreSettings(createSupabaseServerClient(getAccessToken(req)));
  res.status(200).json(settings);
});

apiRoute.put(async (req, res) => {
  const payload = req.body as Partial<StoreSettings>;

  if (!payload.storeName?.trim()) {
    return res.status(400).json({ error: "Store name is required." });
  }

  const settings = await updateStoreSettings(payload, createSupabaseServerClient(getAccessToken(req)));
  res.status(200).json(settings);
});

export default apiRoute;
