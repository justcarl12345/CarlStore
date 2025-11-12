'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
} | null>(null)

// Helper functions for localStorage
const CART_STORAGE_KEY = 'ecommerce-cart'

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
    return []
  }
}

const setStoredCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState

  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      } else {
        newState = {
          ...state,
          items: [...state.items, action.payload]
        }
      }
      break

    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      }
      break

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
        newState = {
          ...state,
          items: state.items.filter(item => item.productId !== action.payload.productId)
        }
      } else {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        }
      }
      break

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      }
      break

    case 'TOGGLE_CART':
      newState = {
        ...state,
        isOpen: !state.isOpen
      }
      break

    case 'SET_CART':
      newState = {
        ...state,
        items: action.payload
      }
      break

    default:
      newState = state
  }

  // Save to localStorage after every action that changes items
  if (action.type !== 'TOGGLE_CART') {
    setStoredCart(newState.items)
  }

  return newState
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = getStoredCart()
    if (storedCart.length > 0) {
      dispatch({ type: 'SET_CART', payload: storedCart })
    }
  }, [])

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}