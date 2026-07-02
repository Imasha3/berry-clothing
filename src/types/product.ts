export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
}

export interface ProductColor {
  name: string;
  code?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  previewUrl?: string;
  resourceType?: "image" | "video";
  alt?: string;
}

export type ProductAvailabilityStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface ProductVariant {
  id: string;
  colorName: string;
  colorCode?: string;
  size: string;
  stockQuantity: number;
  skuSuffix?: string;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  originalPrice?: number;
  discountedPrice?: number;
  isDiscounted?: boolean;
  sizes: string[];
  colors: ProductColor[];
  material: string;
  description: string;
  images: ProductImage[];
  mainImage: string;
  minStockLevel: number;
  stockQuantity: number;
  availabilityStatus: ProductAvailabilityStatus;
  variants: ProductVariant[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSaleItem: boolean;
  featuredReview?: Review;
}
