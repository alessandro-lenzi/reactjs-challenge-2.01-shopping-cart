import { Product } from "../types";

export function productSorter(a: Product, b: Product) {
  return a.id - b.id;
};