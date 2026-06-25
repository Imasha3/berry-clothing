import mongoose from "mongoose";
import type { StoreSettings } from "@/types/settings";

const storeSettingsSchema = new mongoose.Schema<StoreSettings>(
  {
    storeName: { type: String, required: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    footerText: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      youtube: { type: String, default: "" }
    },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      branch: { type: String, default: "" }
    },
    businessInfo: { type: String, default: "" },
    returnPolicy: { type: String, default: "" },
    exchangePolicy: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: "storeSettings"
  }
);

export const StoreSettingsModel =
  mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);
