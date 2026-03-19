import { create } from 'zustand';

export const useStore = create((set) => ({
  isStoreOpen: true,
  isOjolActive: true,
  ojolStockLimit: 20,
  orderType: 'offline',
  cart: [],

  toggleStore: () => set((state) => ({ isStoreOpen: !state.isStoreOpen })),
  toggleOjol: () => set((state) => ({ isOjolActive: !state.isOjolActive })),
  setOjolLimit: (val) => set({ ojolStockLimit: val }),
  setOrderType: (type) => set({ orderType: type }),

  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return { cart: state.cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item 
      )};
    }
    return { cart: [...state.cart, { ...product, quantity: 1, notes: "" }] };
  }),

  updateQuantity: (id, delta) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    })
  })),

  updateNotes: (id, notes) => set((state) => ({
    cart: state.cart.map(item => item.id === id ? { ...item, notes } : item)
  })),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item.id !== id)
  })),

  clearCart: () => set({ cart: [] }),
}));