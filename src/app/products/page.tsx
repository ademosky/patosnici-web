import { getProducts } from "../data/products";
import { brands } from "../data/brands";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductsClient initialProducts={products} brands={brands} />;
}