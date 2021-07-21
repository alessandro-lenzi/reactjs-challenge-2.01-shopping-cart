import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { CartProduct, Product, Stock } from '../types';
import { productSorter } from '../util/productSorter';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartItemsAmount {
  [key: number]: number;
}
interface CartContextData {
  cart: CartProduct[];
  cartItemsAmount: CartItemsAmount;
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cartItemsAmount, setCartItemsAmount] = useState<CartItemsAmount>({});
  const [cart, setCart] = useState<CartProduct[]>(() => {
    const storedCart = localStorage.getItem('@RocketShoes:cart');
    if (storedCart) {
      return JSON.parse(storedCart);
    }
    return [];
  });

  useEffect(() => {
    const amounts = cart.reduce((acc, cartProduct) => {
      acc[cartProduct.id] = cartProduct.amount;
      return acc;
    }, {} as CartItemsAmount);
    setCartItemsAmount(amounts);

    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get<Product>(`/products/${productId}`);
      if (!response || response.status !== 200 || !response.data) {
        throw new Error("Erro na adição do produto");
      }
      const product = response.data;

      const stockResponse = await api.get<Stock>(`/stock/${productId}`);
      if (!stockResponse || stockResponse.status !== 200 || !stockResponse.data) {
        throw new Error("Erro na adição do produto");
      }
      const stock = stockResponse.data;

      const cartItem = cart.find(item => item.id === productId);
      const currentAmount = cartItem?.amount || 0;

      if (stock.amount - currentAmount <= 0) {
        throw new Error('Quantidade solicitada fora de estoque');
      } else {

        const newCartItem = {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          amount: currentAmount + 1,
        };

        const otherItems = cart.filter(item => item.id !== product.id);
        setCart([newCartItem, ...otherItems].sort(productSorter));
      }
      // toast.success(`Produto adicionado ao carrinho`);
    } catch (exception) {
      toast.error(exception.message);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartItem = cart.find(item => item.id === productId);
      if (!cartItem) {
        throw new Error('Erro na remoção do produto');
      }

      const otherItems = cart.filter(item => item.id !== productId);
      setCart(otherItems.sort(productSorter));

      // toast.success(`Produto removido do carrinho`);
    } catch (exception) {
      toast.error(exception.message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const cartItem = cart.find(item => item.id === productId);
      if (!cartItem || amount < 1 || amount === cartItem.amount) {
        throw new Error('Erro na alteração de quantidade do produto');
      }

      await api.get<Stock>(`/stock/${productId}`).then(response => {
        const stock = response.data;
        if( stock.amount - amount < 0 ) {
          throw new Error('Quantidade solicitada fora de estoque');
        }

        cartItem.amount = amount;

        const otherItems = cart.filter(item => item.id !== productId);
        if (cartItem.amount > 0)
          setCart([...otherItems, cartItem].sort(productSorter));
        else
          setCart(otherItems.sort(productSorter));

        //toast.success(`Produto atualizado`);
      });
    } catch (exception) {
      toast.error(exception.message);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, cartItemsAmount, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
