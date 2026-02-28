'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cartApi } from '@/lib/api'
import Header from '@/components/Header'

interface CartItem {
  id: number
  product_id: number
  product: any
  quantity: number
  unit_price: number
  subtotal: number
}

interface Cart {
  id: number
  items: CartItem[]
  summary: {
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
    item_count: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<number[]>([])

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        if (user) {
          const response = await cartApi.getCart()
          setCart(response.data.data)
        } else {
          setCart(null)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    setUpdatingItems((prev) => [...prev, itemId])
    try {
      if (quantity === 0) {
        await cartApi.removeItem(itemId)
      } else {
        await cartApi.updateItem(itemId, quantity)
      }
      const response = await cartApi.getCart()
      setCart(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cart')
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== itemId))
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    await handleUpdateQuantity(itemId, 0)
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    try {
      await cartApi.clearCart()
      setCart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-slate-900"></div>
            </div>
            <p className="text-gray-300 mt-4 text-lg">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Shopping Cart</h1>
          <p className="text-gray-400 text-lg mt-2">Review and manage your items</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur">
            <p className="text-red-400 font-medium">⚠️ {error}</p>
          </div>
        )}

        {isEmpty ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-12 text-center backdrop-blur">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-300 text-lg mb-6">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-white">
                    Items in Cart <span className="text-gray-400 text-lg">({cart.summary.item_count})</span>
                  </h2>
                </div>

                <div className="divide-y divide-slate-600">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-lg border border-slate-500 hover:border-slate-400 transition-colors"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center border border-slate-500">
                              <span className="text-gray-400 text-2xl">📦</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-gray-400 mt-1">${item.unit_price.toFixed(2)} each</p>

                          {/* Quantity Controls */}
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItems.includes(item.id)}
                              className="px-3 py-1 border border-slate-500 rounded-lg hover:bg-slate-700 hover:border-blue-500 transition-colors disabled:opacity-50 text-white font-semibold"
                            >
                              −
                            </button>
                            <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItems.includes(item.id)}
                              className="px-3 py-1 border border-slate-500 rounded-lg hover:bg-slate-700 hover:border-blue-500 transition-colors disabled:opacity-50 text-white font-semibold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updatingItems.includes(item.id)}
                              className="ml-auto px-4 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right flex flex-col justify-between">
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-700/30 px-6 py-4 flex justify-between items-center border-t border-slate-600">
                  <button
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/products"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Continue Shopping →
                  </Link>
                </div>
              </div>
            </div>

            {/* Summary and Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h3 className="text-xl font-semibold text-white">Order Summary</h3>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>${cart.summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (10%)</span>
                      <span>${cart.summary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span>${cart.summary.shipping.toFixed(2)}</span>
                    </div>
                    {cart.summary.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-${cart.summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ${cart.summary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(user ? '/checkout' : '/auth/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 mt-6"
                  >
                    {user ? '→ Proceed to Checkout' : '→ Sign In to Checkout'}
                  </button>

                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm text-gray-300">
                    <p>🔒 <span className="font-semibold">Secure checkout</span> with SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>&copy; 2026 Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
