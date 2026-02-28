'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cartApi, orderApi } from '@/lib/api'
import Header from '@/components/Header'

interface CartData {
  id: number
  items: Array<{
    id: number
    product_id: number
    product: any
    quantity: number
    unit_price: number
    subtotal: number
  }>
  summary: {
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
    item_count: number
  }
}

interface FormData {
  shipping_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  billing_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  sameAsBilling: boolean
  shipping_method: string
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  const [formData, setFormData] = useState<FormData>({
    shipping_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    },
    billing_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    },
    sameAsBilling: true,
    shipping_method: 'standard',
    notes: '',
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchCart = async () => {
      try {
        setLoading(true)
        const response = await cartApi.getCart()
        setCart(response.data.data)
        if (response.data.data.items.length === 0) {
          router.push('/cart')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [authLoading, user, router])

  const validateCart = async () => {
    try {
      setValidationError(null)
      await cartApi.validate()
      return true
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Cart validation failed')
      return false
    }
  }

  const handleAddressChange = (type: 'shipping' | 'billing', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === 'shipping' ? 'shipping_address' : 'billing_address']: {
        ...prev[type === 'shipping' ? 'shipping_address' : 'billing_address'],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await validateCart()
    if (!isValid) return

    setSubmitting(true)
    setError(null)

    try {
      const orderData = {
        shipping_address: formData.shipping_address,
        billing_address: formData.sameAsBilling ? formData.shipping_address : formData.billing_address,
        shipping_method: formData.shipping_method,
        notes: formData.notes,
      }

      const response = await orderApi.create(orderData)
      const order = response.data.data
      router.push(`/orders/${order.id}?status=created`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-slate-900"></div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400 text-lg">Complete your purchase securely</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur">
            <p className="text-red-400 font-medium">⚠️ {error}</p>
          </div>
        )}

        {validationError && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur">
            <p className="text-yellow-400 font-medium">⚠️ {validationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Shipping Address */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-slate-500 transition-colors">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
                    Shipping Address
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.shipping_address.street}
                    onChange={(e) => handleAddressChange('shipping', 'street', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.shipping_address.city}
                      onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.shipping_address.state}
                      onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.shipping_address.zip}
                      onChange={(e) => handleAddressChange('shipping', 'zip', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.shipping_address.country}
                      onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Billing Address */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-slate-500 transition-colors">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
                    Billing Address
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sameAsBilling: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 accent-blue-600"
                    />
                    <span className="text-white font-medium">Same as shipping address</span>
                  </label>

                  {!formData.sameAsBilling && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-slate-600">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.billing_address.street}
                        onChange={(e) => handleAddressChange('billing', 'street', e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.billing_address.city}
                          onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={formData.billing_address.state}
                          onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={formData.billing_address.zip}
                          onChange={(e) => handleAddressChange('billing', 'zip', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={formData.billing_address.country}
                          onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Shipping Method */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-slate-500 transition-colors">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
                    Shipping Method
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { value: 'standard', label: 'Standard', time: '5-7 business days', icon: '📦' },
                    { value: 'express', label: 'Express', time: '2-3 business days', icon: '🚚' },
                    { value: 'overnight', label: 'Overnight', time: '1 business day', icon: '✈️' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.shipping_method === method.value
                          ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_method"
                        value={method.value}
                        checked={formData.shipping_method === method.value}
                        onChange={(e) => setFormData((prev) => ({ ...prev, shipping_method: e.target.value }))}
                        className="w-5 h-5 accent-blue-600 cursor-pointer"
                      />
                      <span className="ml-4 flex-1">
                        <span className="text-lg mr-2">{method.icon}</span>
                        <span className="font-semibold text-white">{method.label}</span>
                        <span className="text-gray-400 text-sm ml-2">{method.time}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 4: Order Notes */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-slate-500 transition-colors">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">4</span>
                    Order Notes (Optional)
                  </h2>
                </div>
                <div className="p-6">
                  <textarea
                    placeholder="Add any special delivery instructions or notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-400">{formData.notes.length}/500</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/50 text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Processing...
                  </span>
                ) : (
                  '✓ Place Order'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden sticky top-24 hover:border-slate-500 transition-colors">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                <h3 className="text-xl font-semibold text-white">Order Summary</h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Items Preview */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Items ({cart.summary.item_count})</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.product.name.substring(0, 20)}...{' '}
                          <span className="text-gray-500">×{item.quantity}</span>
                        </span>
                        <span className="text-white font-medium">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-600"></div>
                </div>

                {/* Pricing Breakdown */}
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
                    <div className="flex justify-between text-green-400 font-medium">
                      <span>Discount</span>
                      <span>-${cart.summary.discount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-600 flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      ${cart.summary.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">🔒 Secure checkout:</span> Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
