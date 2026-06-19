import type { Product } from "@/types/product";

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    productName: "Rosette Linen Midi Dress",
    sku: "BC-DR-001",
    category: "Dresses",
    price: 8990,
    discountPrice: 7490,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Rose Pink", code: "#d88ca1" },
      { name: "Ivory", code: "#f4efe7" }
    ],
    material: "Premium linen blend",
    description:
      "A softly tailored midi dress with puff sleeves and a flattering waistline made for effortless day-to-night dressing.",
    images: [
      {
        id: "prod-1-img-1",
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
        alt: "Rosette Linen Midi Dress front view"
      },
      {
        id: "prod-1-img-2",
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
        alt: "Rosette Linen Midi Dress styling detail"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 8,
    stockQuantity: 18,
    availabilityStatus: "In Stock",
    variants: [
      { id: "prod-1-v1", colorName: "Rose Pink", colorCode: "#d88ca1", size: "S", stockQuantity: 5 },
      { id: "prod-1-v2", colorName: "Rose Pink", colorCode: "#d88ca1", size: "M", stockQuantity: 7 },
      { id: "prod-1-v3", colorName: "Rose Pink", colorCode: "#d88ca1", size: "L", stockQuantity: 2 },
      { id: "prod-1-v4", colorName: "Ivory", colorCode: "#f4efe7", size: "S", stockQuantity: 1 },
      { id: "prod-1-v5", colorName: "Ivory", colorCode: "#f4efe7", size: "M", stockQuantity: 2 },
      { id: "prod-1-v6", colorName: "Ivory", colorCode: "#f4efe7", size: "L", stockQuantity: 1 }
    ],
    isNewArrival: true,
    isBestSeller: true,
    isSaleItem: true,
    featuredReview: {
      id: "rev-1",
      customerName: "Ayesha",
      rating: 5,
      comment: "Beautiful fit and the fabric feels very premium.",
      approved: true
    }
  },
  {
    id: "prod-2",
    productName: "Berry Bloom Co-ord Set",
    sku: "BC-CO-002",
    category: "Co-ords",
    price: 10990,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Soft Beige", code: "#d8c6b5" },
      { name: "Black", code: "#111111" }
    ],
    material: "Cotton satin",
    description:
      "An elevated matching set with a relaxed shirt and wide-leg pant that moves with you through the day.",
    images: [
      {
        id: "prod-2-img-1",
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        alt: "Berry Bloom Co-ord Set studio view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 6,
    stockQuantity: 9,
    availabilityStatus: "Low Stock",
    variants: [
      { id: "prod-2-v1", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "S", stockQuantity: 2 },
      { id: "prod-2-v2", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "M", stockQuantity: 1 },
      { id: "prod-2-v3", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "L", stockQuantity: 3 },
      { id: "prod-2-v4", colorName: "Black", colorCode: "#111111", size: "M", stockQuantity: 1 },
      { id: "prod-2-v5", colorName: "Black", colorCode: "#111111", size: "L", stockQuantity: 1 },
      { id: "prod-2-v6", colorName: "Black", colorCode: "#111111", size: "XL", stockQuantity: 1 }
    ],
    isNewArrival: true,
    isBestSeller: false,
    isSaleItem: false
  },
  {
    id: "prod-3",
    productName: "Pearl Button Blouse",
    sku: "BC-TP-003",
    category: "Tops",
    price: 5990,
    discountPrice: 4990,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "White", code: "#ffffff" },
      { name: "Blush", code: "#f1cbd1" }
    ],
    material: "Silky crepe",
    description:
      "A polished blouse with pearl accents, soft drape, and an easy fit for office and weekend styling.",
    images: [
      {
        id: "prod-3-img-1",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        alt: "Pearl Button Blouse front view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 10,
    stockQuantity: 22,
    availabilityStatus: "In Stock",
    variants: [
      { id: "prod-3-v1", colorName: "White", colorCode: "#ffffff", size: "S", stockQuantity: 6 },
      { id: "prod-3-v2", colorName: "White", colorCode: "#ffffff", size: "M", stockQuantity: 4 },
      { id: "prod-3-v3", colorName: "White", colorCode: "#ffffff", size: "L", stockQuantity: 3 },
      { id: "prod-3-v4", colorName: "Blush", colorCode: "#f1cbd1", size: "S", stockQuantity: 2 },
      { id: "prod-3-v5", colorName: "Blush", colorCode: "#f1cbd1", size: "M", stockQuantity: 4 },
      { id: "prod-3-v6", colorName: "Blush", colorCode: "#f1cbd1", size: "L", stockQuantity: 3 }
    ],
    isNewArrival: false,
    isBestSeller: true,
    isSaleItem: true
  },
  {
    id: "prod-4",
    productName: "Midnight Tailored Trousers",
    sku: "BC-BT-004",
    category: "Bottoms",
    price: 6990,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Black", code: "#111111" }],
    material: "Structured suiting blend",
    description:
      "Clean-line tailored trousers with a high-rise fit designed for flattering, all-day comfort.",
    images: [
      {
        id: "prod-4-img-1",
        url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80",
        alt: "Midnight Tailored Trousers full-length view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 8,
    stockQuantity: 18,
    availabilityStatus: "In Stock",
    variants: [
      { id: "prod-4-v1", colorName: "Black", colorCode: "#111111", size: "S", stockQuantity: 4 },
      { id: "prod-4-v2", colorName: "Black", colorCode: "#111111", size: "M", stockQuantity: 5 },
      { id: "prod-4-v3", colorName: "Black", colorCode: "#111111", size: "L", stockQuantity: 5 },
      { id: "prod-4-v4", colorName: "Black", colorCode: "#111111", size: "XL", stockQuantity: 4 }
    ],
    isNewArrival: false,
    isBestSeller: true,
    isSaleItem: false
  },
  {
    id: "prod-5",
    productName: "Weekend Muse Maxi Dress",
    sku: "BC-DR-005",
    category: "Dresses",
    price: 9990,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Berry Floral" }],
    material: "Printed rayon",
    description:
      "A breezy maxi with movement and volume, ideal for casual gatherings, travel, and holiday styling.",
    images: [
      {
        id: "prod-5-img-1",
        url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
        alt: "Weekend Muse Maxi Dress editorial view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 5,
    stockQuantity: 0,
    availabilityStatus: "Out of Stock",
    variants: [
      { id: "prod-5-v1", colorName: "Berry Floral", size: "M", stockQuantity: 0 },
      { id: "prod-5-v2", colorName: "Berry Floral", size: "L", stockQuantity: 0 },
      { id: "prod-5-v3", colorName: "Berry Floral", size: "XL", stockQuantity: 0 }
    ],
    isNewArrival: true,
    isBestSeller: false,
    isSaleItem: false
  },
  {
    id: "prod-6",
    productName: "Soft Beige Everyday Tee",
    sku: "BC-TP-006",
    category: "Tops",
    price: 3490,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Soft Beige", code: "#d8c6b5" },
      { name: "Black", code: "#111111" },
      { name: "White", code: "#ffffff" }
    ],
    material: "Combed cotton",
    description: "A wardrobe essential with a premium hand-feel and versatile slim silhouette.",
    images: [
      {
        id: "prod-6-img-1",
        url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80",
        alt: "Soft Beige Everyday Tee front view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 12,
    stockQuantity: 35,
    availabilityStatus: "In Stock",
    variants: [
      { id: "prod-6-v1", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "S", stockQuantity: 5 },
      { id: "prod-6-v2", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "M", stockQuantity: 4 },
      { id: "prod-6-v3", colorName: "Soft Beige", colorCode: "#d8c6b5", size: "L", stockQuantity: 4 },
      { id: "prod-6-v4", colorName: "Black", colorCode: "#111111", size: "S", stockQuantity: 4 },
      { id: "prod-6-v5", colorName: "Black", colorCode: "#111111", size: "M", stockQuantity: 5 },
      { id: "prod-6-v6", colorName: "White", colorCode: "#ffffff", size: "M", stockQuantity: 7 },
      { id: "prod-6-v7", colorName: "White", colorCode: "#ffffff", size: "L", stockQuantity: 6 }
    ],
    isNewArrival: false,
    isBestSeller: true,
    isSaleItem: false
  },
  {
    id: "prod-7",
    productName: "Ribbon Detail Skirt",
    sku: "BC-BT-007",
    category: "Bottoms",
    price: 6290,
    discountPrice: 5290,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Ivory", code: "#f4efe7" },
      { name: "Dusty Pink", code: "#c98e99" }
    ],
    material: "Cotton twill",
    description:
      "A structured mini skirt with feminine ribbon detailing and a clean zip-back finish.",
    images: [
      {
        id: "prod-7-img-1",
        url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
        alt: "Ribbon Detail Skirt front view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 8,
    stockQuantity: 7,
    availabilityStatus: "Low Stock",
    variants: [
      { id: "prod-7-v1", colorName: "Ivory", colorCode: "#f4efe7", size: "S", stockQuantity: 2 },
      { id: "prod-7-v2", colorName: "Ivory", colorCode: "#f4efe7", size: "M", stockQuantity: 1 },
      { id: "prod-7-v3", colorName: "Dusty Pink", colorCode: "#c98e99", size: "M", stockQuantity: 2 },
      { id: "prod-7-v4", colorName: "Dusty Pink", colorCode: "#c98e99", size: "L", stockQuantity: 2 }
    ],
    isNewArrival: false,
    isBestSeller: false,
    isSaleItem: true
  },
  {
    id: "prod-8",
    productName: "Luna Evening Co-ord",
    sku: "BC-CO-008",
    category: "Co-ords",
    price: 12490,
    discountPrice: 11490,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Black", code: "#111111" },
      { name: "Champagne", code: "#d9c19a" }
    ],
    material: "Soft shimmer weave",
    description:
      "An occasion-ready co-ord set with subtle shimmer, sharp tailoring, and standout evening appeal.",
    images: [
      {
        id: "prod-8-img-1",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        alt: "Luna Evening Co-ord mock campaign view"
      }
    ],
    mainImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    minStockLevel: 6,
    stockQuantity: 11,
    availabilityStatus: "In Stock",
    variants: [
      { id: "prod-8-v1", colorName: "Black", colorCode: "#111111", size: "S", stockQuantity: 2 },
      { id: "prod-8-v2", colorName: "Black", colorCode: "#111111", size: "M", stockQuantity: 1 },
      { id: "prod-8-v3", colorName: "Champagne", colorCode: "#d9c19a", size: "S", stockQuantity: 2 },
      { id: "prod-8-v4", colorName: "Champagne", colorCode: "#d9c19a", size: "M", stockQuantity: 3 },
      { id: "prod-8-v5", colorName: "Champagne", colorCode: "#d9c19a", size: "L", stockQuantity: 3 }
    ],
    isNewArrival: true,
    isBestSeller: true,
    isSaleItem: true
  }
];
