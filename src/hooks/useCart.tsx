import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { CartProduct, Product, Stock } from '../types';

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

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];

      const cartItem = updatedCart.find(item => item.id === productId);
      const currentAmount = cartItem?.amount || 0;
      const amount = currentAmount + 1;

      const stockResponse = await api.get<Stock>(`/stock/${productId}`);
      if (!stockResponse || !stockResponse.data) {
        toast.error("Erro na adição do produto");
        return;
      }

      const stock = stockResponse.data;
      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (cartItem) {
        cartItem.amount = amount;
      } else {
        const response = await api.get<Product>(`/products/${productId}`);
        if (!response || response.status !== 200 || !response.data) {
          toast.error("Erro na adição do produto");
          return;
        }
        const product = response.data;

        const newCartItem = {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          amount: amount,
        };

        updatedCart.push(newCartItem);
      }

      //updatedCart.sort(productSorter);
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      toast.success(`Produto adicionado ao carrinho`);
    } catch (exception) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) {
      toast.error('Erro na remoção do produto');
      return;
    }

    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

    toast.success(`Produto removido do carrinho`);
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = [...cart];

      const cartItem = updatedCart.find(item => item.id === productId);
      if (!cartItem || amount < 1 || amount === cartItem.amount) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }

      const stockResponse = await api.get<Stock>(`/stock/${productId}`);
      const stock = stockResponse.data;
      if( stock.amount < amount ) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      cartItem.amount = amount;

      const item = updatedCart.find(item => item.id === productId);
      if( item ) {
        console.log(`Atualizando produto ${item.id} amount para ${item.amount}`);
      }

      //updatedCart.sort(productSorter);
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      toast.success(`Produto atualizado`);
    } catch (exception) {
      toast.error(exception.message);
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
