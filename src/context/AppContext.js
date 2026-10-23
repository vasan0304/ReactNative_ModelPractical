import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_PRODUCTS } from '../data/groceryData';

const AppContext = createContext();

const STORAGE_KEYS = {
  USER: '@freshmart_user_v2',
  CART: '@freshmart_cart_v2',
  FAVORITES: '@freshmart_favorites_v2',
  PRODUCTS: '@freshmart_products_v2',
};

const DEFAULT_USER = {
  name: 'Keerthivasan',
  email: 'keerthi.customer@rvscas.ac.in',
  phone: '9876543210',
  address: 'RVS Campus, Sulur, Coimbatore',
  role: 'customer', // 'customer' or 'admin'
  isAuthenticated: true,
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [favorites, setFavorites] = useState(['prod-1', 'prod-4']);
  const [cart, setCart] = useState([
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[2], quantity: 1 },
  ]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [cartNotification, setCartNotification] = useState(null);

  const hideCartNotification = () => {
    setCartNotification(null);
  };

  const showCartNotification = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setCartNotification({
      visible: true,
      product,
      message: 'Item added to cart! 🛒',
      subMessage: `${product.name} (Qty: ${qty}) • ₹${product.price * qty}`,
    });
  };

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) setUser(JSON.parse(savedUser));

        const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

        const savedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) setProducts(JSON.parse(savedProducts));
      } catch (err) {
        console.warn('Failed to load local storage:', err);
      }
    };
    loadState();
  }, []);

  // Save changes to storage
  const persistUser = async (updated) => {
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistFavorites = async (updatedFavs) => {
    setFavorites(updatedFavs);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavs));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistCart = async (updatedCart) => {
    setCart(updatedCart);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistProducts = async (updatedProducts) => {
    setProducts(updatedProducts);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    } catch (e) {
      console.warn(e);
    }
  };

  // Auth actions
  const login = (email, password, role = 'customer', name = '') => {
    const newUser = {
      name: name || (role === 'admin' ? 'Store Administrator' : 'Keerthivasan'),
      email,
      phone: user.phone || '9876543210',
      address: user.address || 'RVS Campus, Sulur, Coimbatore',
      role,
      isAuthenticated: true,
    };
    persistUser(newUser);
  };

  const logout = () => {
    const updated = { ...user, isAuthenticated: false };
    persistUser(updated);
  };

  const switchUserRole = (newRole) => {
    const updated = {
      ...user,
      role: newRole,
      name: newRole === 'admin' ? 'Store Administrator' : (user.name || 'Keerthivasan'),
    };
    persistUser(updated);
  };

  const updateProfile = (profileData) => {
    const updated = {
      ...user,
      ...profileData,
    };
    persistUser(updated);
  };

  // Favorites actions
  const toggleFavorite = (productId) => {
    let nextFavs;
    if (favorites.includes(productId)) {
      nextFavs = favorites.filter((id) => id !== productId);
    } else {
      nextFavs = [...favorites, productId];
    }
    persistFavorites(nextFavs);
  };

  const isFavorite = (productId) => favorites.includes(productId);

  // Cart actions - Customer only!
  const addToCart = (product, quantity = 1) => {
    if (user.role !== 'customer') {
      return { success: false, message: 'Cart access is restricted to Customers only.' };
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let nextCart;
    if (existingIndex > -1) {
      nextCart = cart.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + qty }
          : item
      );
    } else {
      nextCart = [...cart, { product, quantity: qty }];
    }
    persistCart(nextCart);
    showCartNotification(product, qty);
    return { success: true, message: `Added ${product.name} to cart!` };
  };

  const incrementCartItem = (productId) => {
    if (user.role !== 'customer') return;
    const nextCart = cart.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    persistCart(nextCart);
  };

  const decrementCartItem = (productId) => {
    if (user.role !== 'customer') return;
    const existing = cart.find((item) => item.product.id === productId);
    if (!existing) return;

    if (existing.quantity <= 1) {
      removeFromCart(productId);
    } else {
      const nextCart = cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      persistCart(nextCart);
    }
  };

  const removeFromCart = (productId) => {
    if (user.role !== 'customer') return;
    const nextCart = cart.filter((item) => item.product.id !== productId);
    persistCart(nextCart);
  };

  const addMultipleToCart = (productList) => {
    if (user.role !== 'customer') {
      return { success: false, message: 'Cart access is restricted to Customers only.' };
    }
    let nextCart = [...cart];
    productList.forEach((prod) => {
      const idx = nextCart.findIndex((item) => item.product.id === prod.id);
      if (idx > -1) {
        nextCart[idx] = { ...nextCart[idx], quantity: nextCart[idx].quantity + 1 };
      } else {
        nextCart.push({ product: prod, quantity: 1 });
      }
    });
    persistCart(nextCart);
    return { success: true, message: 'Added all items to cart!' };
  };

  const clearCart = () => {
    persistCart([]);
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  // Coupons
  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'FRESH20' || cleanCode === 'DISCOUNT20') {
      setCouponCode(cleanCode);
      setCouponDiscountPercent(20);
      return { success: true, message: 'Coupon applied! 20% discount applied.' };
    } else if (cleanCode === 'FRESH10' || cleanCode === 'SAVE10') {
      setCouponCode(cleanCode);
      setCouponDiscountPercent(10);
      return { success: true, message: 'Coupon applied! 10% discount applied.' };
    } else {
      return { success: false, message: 'Invalid coupon. Try "FRESH20" or "FRESH10".' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  // Admin add product
  const addProduct = (newProduct) => {
    const item = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviews: 1,
      inStock: true,
    };
    const nextProducts = [item, ...products];
    persistProducts(nextProducts);
    return item;
  };

  // Calculations in INR Rupees (₹)
  const cartTotalCount = user.role === 'customer'
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const cartSubtotal = user.role === 'customer'
    ? cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    : 0;

  const discountAmount = Math.round((cartSubtotal * couponDiscountPercent) / 100);
  const deliveryFee = cartSubtotal >= 500 || cartSubtotal === 0 ? 0 : 40;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        favorites,
        cart,
        couponCode,
        couponDiscountPercent,
        cartTotalCount,
        cartSubtotal,
        discountAmount,
        deliveryFee,
        cartFinalTotal,
        login,
        logout,
        switchUserRole,
        updateProfile,
        toggleFavorite,
        isFavorite,
        addToCart,
        incrementCartItem,
        decrementCartItem,
        removeFromCart,
        addMultipleToCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        addProduct,
        cartNotification,
        showCartNotification,
        hideCartNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
