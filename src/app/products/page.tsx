import { getProductsByCategory } from "../data/products";
import { brands } from "../data/brands";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProductsByCategory("rubber_mats");
  return <ProductsClient initialProducts={products} brands={brands} />;
}