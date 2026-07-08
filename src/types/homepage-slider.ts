export interface HomepageSliderItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
