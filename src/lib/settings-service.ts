import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { connectToMongo, isMongoConfigured } from "@/lib/mongodb";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import { StoreSettingsModel } from "@/models/storeSettings";
import type { StoreSettings } from "@/types/settings";

const localSettingsPath = path.join(tmpdir(), "berry-clothing", "store-settings.json");

export function normalizeStoreSettings(settings?: Partial<StoreSettings> | null): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    socialLinks: {
      ...DEFAULT_STORE_SETTINGS.socialLinks,
      ...settings?.socialLinks
    },
    bankDetails: {
      ...DEFAULT_STORE_SETTINGS.bankDetails,
      ...settings?.bankDetails
    }
  };
}

async function readLocalSettings() {
  try {
    const content = await fs.readFile(localSettingsPath, "utf8");
    return normalizeStoreSettings(JSON.parse(content) as Partial<StoreSettings>);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

async function writeLocalSettings(settings: StoreSettings) {
  await fs.mkdir(path.dirname(localSettingsPath), { recursive: true });
  await fs.writeFile(localSettingsPath, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}

export async function getStoreSettings() {
  if (!isMongoConfigured()) {
    return readLocalSettings();
  }

  await connectToMongo();
  const settings = await StoreSettingsModel.findOne().lean<Partial<StoreSettings>>();
  return normalizeStoreSettings(settings);
}

export async function updateStoreSettings(payload: Partial<StoreSettings>) {
  const nextSettings = normalizeStoreSettings(payload);

  if (!isMongoConfigured()) {
    return writeLocalSettings(nextSettings);
  }

  await connectToMongo();
  const settings = await StoreSettingsModel.findOneAndUpdate({}, nextSettings, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }).lean<Partial<StoreSettings>>();

  return normalizeStoreSettings(settings);
}
