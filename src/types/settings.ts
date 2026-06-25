export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface BankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
}

export interface StoreSettings {
  storeName: string;
  logo?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  footerText?: string;
  socialLinks: SocialLinks;
  bankDetails: BankDetails;
  returnPolicy?: string;
  exchangePolicy?: string;
}
