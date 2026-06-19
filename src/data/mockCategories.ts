import type { Category } from "@/types/product";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Tops",
    slug: "tops",
    description: "Statement blouses and wardrobe basics in feminine cuts.",
    status: "Active",
    createdAt: "2026-05-10T08:30:00.000Z",
    updatedAt: "2026-06-04T09:45:00.000Z"
  },
  {
    id: "cat-2",
    name: "T-shirts",
    slug: "t-shirts",
    description: "Casual everyday tees with clean fits, soft fabrics, and easy styling.",
    status: "Active",
    createdAt: "2026-05-12T10:15:00.000Z",
    updatedAt: "2026-06-03T07:20:00.000Z"
  },
  {
    id: "cat-3",
    name: "Frocks",
    slug: "frocks",
    description: "Pretty frocks designed for daytime outings, events, and special moments.",
    status: "Active",
    createdAt: "2026-05-15T11:00:00.000Z",
    updatedAt: "2026-06-01T13:10:00.000Z"
  },
  {
    id: "cat-4",
    name: "Full dress",
    slug: "full-dress",
    description: "Complete dress looks with elegant silhouettes for polished styling.",
    status: "Active",
    createdAt: "2026-05-18T14:25:00.000Z",
    updatedAt: "2026-05-29T16:00:00.000Z"
  }
];
