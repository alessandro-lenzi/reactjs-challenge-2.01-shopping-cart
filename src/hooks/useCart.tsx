import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { CartProduct } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: CartProduct[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<CartProduct[]>(() => {
    const storedCart = localStorage.getItem('@RocketShoes:cart');
    if (storedCart) {
      return JSON.parse(storedCart);
    }
    return [];
  });

  const getCartProduct = (productId: number) => cart.find(item => item.id === productId);

  const verifyCartProduct = (productId: number) => {
    if (!getCartProduct(productId)) throw new Error();
  };

  const hasStockAvailable = async (productId: number, amount: number) => {
    const { data } = await api.get(`/stock/${productId}`);
    const hasStock = amount <= data.amount;
    if (!hasStock) {
      toast.error('Quantidade solicitada fora de estoque');
    }
    return hasStock;
  };

  const addProduct = async (productId: number) => {
    try {
      const cartItem = cart.find(item => item.id === productId);
      const amount = (cartItem?.amount || 0) + 1;

      if (cartItem) {
        return updateProductAmount({productId, amount});
      }

      const hasStock = await hasStockAvailable(productId, amount);
      if (!hasStock) return;

      const { data } = await api.get(`/products/${productId}`);
      const updatedCart = [...cart, {...data, amount: 1}];

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      toast.success(`Produto adicionado ao carrinho`);
    } catch (exception) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      verifyCartProduct(productId);

      const updatedCart = cart.filter(item => item.id !== productId);
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      toast.success(`Produto removido do carrinho`);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };


  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1)
        return;

      verifyCartProduct(productId);

      const hasStock = await hasStockAvailable(productId, amount);
      if (!hasStock) return;

      const updatedCart = cart.map(item => {
        if (item.id === productId) item.amount = amount;
        return item;
      });

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      toast.success(`Produto atualizado`);
    } catch (exception) {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
