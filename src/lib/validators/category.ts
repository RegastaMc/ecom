import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase, hyphens only"),
  description: z.string().max(500).optional().or(z.literal("")),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
