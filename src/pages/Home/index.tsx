import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { useCart } from '../../hooks/useCart';
import { Product, ProductStock } from '../../types';
import { formatPrice } from '../../util/format';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const { addProduct, cart } = useCart();
  const [cartItemsAmount, setCartItemsAmount] = useState<CartItemsAmount>({});

  useEffect(() => {
    const amounts = products.reduce((acc, product) => {
      acc[product.id] = cart.find(cartItem => cartItem.id === product.id)?.amount || 0;
      return acc;
    }, {} as CartItemsAmount);
    setCartItemsAmount(amounts);
  }, [products, cart]);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('/products');
      const results = response.data.map(product => {
        return {
          ...product,
          priceFormatted: formatPrice(product.price),
        };
      });
      setProducts(results); //.sort(productSorter));
    }

    loadProducts();
  }, []);

  function handleAddProduct(product: ProductStock) {
    addProduct(product.id);
  }

  return products && cart && (
    <ProductList>
      {products.map(product => (
      <li key={product.id}>
        <img src={product.image} alt={product.title} />
        <strong>{product.title}</strong>
        <span>{product.priceFormatted}</span>
        <button
          type="button"
          data-testid="add-product-button"
          onClick={() => handleAddProduct(product)}
        >
          <div data-testid="cart-product-quantity">
            <MdAddShoppingCart size={16} color="#FFF" />
            {cartItemsAmount[product.id] || 0}
          </div>

          <span>ADICIONAR AO CARRINHO</span>
        </button>
      </li>
      ))}
    </ProductList>
  );
};

export default Home;
