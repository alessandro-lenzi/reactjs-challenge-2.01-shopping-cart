import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { useCart } from '../../hooks/useCart';
import { Product, ProductStock } from '../../types';
import { productSorter } from '../../util/productSorter';
import { formatPrice } from '../../util/format';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const { addProduct, cartItemsAmount } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('/products');
      const results = response.data.map(product => {
        return {
          ...product,
          priceFormatted: formatPrice(product.price),
        };
      });
      setProducts(results.sort(productSorter));
    }

    loadProducts();
  }, []);

  function handleAddProduct(product: ProductStock) {
    addProduct(product.id);
  }

  return (
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
            {cartItemsAmount ? cartItemsAmount[product.id] || 0 : 0}
          </div>

          <span>ADICIONAR AO CARRINHO</span>
        </button>
      </li>
      ))}
    </ProductList>
  );
};

export default Home;
