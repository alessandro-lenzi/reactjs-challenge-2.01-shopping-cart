
export interface Stock {
  id: number;
  amount: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}
export interface CartProduct extends Product {
  amount: number;
}

export interface ProductStock extends Product {
  priceFormatted: string;
  // inStock: number;
}
