export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  subCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
};
