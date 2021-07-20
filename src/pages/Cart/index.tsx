import { useEffect, useState } from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { CartProduct } from '../../types';
import { formatPrice } from '../../util/format';

import { Container, ProductTable, Total } from './styles';

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    setCartTotal(cart.reduce((acc, item) => acc + item.amount * item.price, 0));
  }, [cart]);

  function handleProductIncrement(product: CartProduct) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount + 1,
    });
  }

  function handleProductDecrement(product: CartProduct) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount - 1,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map(cartItem => (
          <tr key={cartItem.id} data-testid="product">
            <td>
              <img src={cartItem.image} alt={cartItem.title} />
            </td>
            <td>
              <strong>{cartItem.title}</strong>
              <span>{formatPrice(cartItem.price)}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                  disabled={cartItem.amount <= 1}
                  onClick={() => handleProductDecrement(cartItem)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={cartItem.amount}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                  onClick={() => handleProductIncrement(cartItem)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{formatPrice(cartItem.amount * cartItem.price)}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
                onClick={() => handleRemoveProduct(cartItem.id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
