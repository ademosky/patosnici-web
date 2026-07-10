import productsData from "./products.json";

export type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  image: string;
  images?: string[];
  description: string;
  sku?: string;
};

export const products: Product[] = productsData as Product[];