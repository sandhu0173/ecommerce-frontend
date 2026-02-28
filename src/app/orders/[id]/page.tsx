'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { orderApi } from '@/lib/api'
import Header from '@/components/Header'

interface OrderData {
  id: number
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  items: Array<{
    id: number
    product_id: number
    product_name: string
    product_sku: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
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
  shipping_method: string
  tracking_number: string | null
  payment_method: string | null
  transaction_id: string | null
  notes: string | null
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
}

export default function OrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isNewOrder = searchParams.get('status') === 'created'

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const orderId = Array.isArray(params.id) ? params.id[0] : (params.id as string)
        if (!orderId) {
          setError('Invalid order ID')
          return
        }
        const response = await orderApi.show(orderId)
        setOrder(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [authLoading, user, router, params])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-slate-900"></div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-12 text-center backdrop-blur">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-400 text-lg mb-6">{error || 'Order not found'}</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200"
            >
              Back to Shopping
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400'
      case 'paid':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'refunded':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '⚙️'
      case 'shipped':
        return '📦'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isNewOrder && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur">
            <p className="text-green-400 font-medium">✓ Order created successfully! Thank you for your purchase.</p>
          </div>
        )}

        {/* Order Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Order Confirmation</h1>
              <p className="text-gray-400 text-lg mt-2">Order #{order.order_number}</p>
            </div>
            <span className={`px-6 py-3 rounded-lg border font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
              <span className="text-2xl">{getStatusIcon(order.status)}</span>
              <span className="capitalize">{order.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Order Status</p>
                <p className={`text-2xl font-bold capitalize ${getStatusColor(order.status).split(' ')[2]}`}>{order.status}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Payment Status</p>
                <p className={`text-2xl font-bold capitalize ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                <h2 className="text-xl font-semibold text-white">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Created */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-500/30"></div>
                      <div className="w-1 h-12 bg-gradient-to-b from-slate-600 to-transparent"></div>
                    </div>
                    <div className="py-1">
                      <p className="font-semibold text-white">Order Placed</p>
                      <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ring-4 ${order.status !== 'pending' ? 'bg-blue-500 ring-blue-500/30' : 'bg-slate-600 ring-slate-600/30'}`}></div>
                      {(order.shipped_at || order.delivered_at) && <div className="w-1 h-12 bg-gradient-to-b from-slate-600 to-transparent"></div>}
                    </div>
                    <div className="py-1">
                      <p className="font-semibold text-white">Processing</p>
                      <p className="text-sm text-gray-400">
                        {order.status !== 'pending' ? 'Order is being prepared for shipment' : 'Awaiting payment'}
                      </p>
                    </div>
                  </div>

                  {/* Shipped */}
                  {order.shipped_at && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ring-4 ${order.status === 'delivered' ? 'bg-blue-500 ring-blue-500/30' : 'bg-slate-600 ring-slate-600/30'}`}></div>
                        {order.delivered_at && <div className="w-1 h-12 bg-gradient-to-b from-slate-600 to-transparent"></div>}
                      </div>
                      <div className="py-1">
                        <p className="font-semibold text-white">Shipped</p>
                        <p className="text-sm text-gray-400">{new Date(order.shipped_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Delivered */}
                  {order.delivered_at && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-500/30"></div>
                      </div>
                      <div className="py-1">
                        <p className="font-semibold text-white">Delivered</p>
                        <p className="text-sm text-gray-400">{new Date(order.delivered_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                <h2 className="text-xl font-semibold text-white">Order Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Product</th>
                      <th className="text-center py-4 px-6 text-gray-400 font-semibold text-sm">Qty</th>
                      <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm">Price</th>
                      <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-600 hover:bg-slate-700/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-white">{item.product_name}</p>
                            <p className="text-sm text-gray-400">SKU: {item.product_sku}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-white">{item.quantity}</td>
                        <td className="py-4 px-6 text-right text-white">${item.unit_price.toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-semibold text-white">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📦 Shipping Address
                </h3>
                <div className="text-gray-400 space-y-2">
                  <p className="font-medium text-white">{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_method && (
                    <p className="mt-3 text-sm pt-3 border-t border-slate-600">
                      <span className="font-semibold">Shipping Method:</span> {order.shipping_method}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  💳 Billing Address
                </h3>
                <div className="text-gray-400 space-y-2">
                  <p className="font-medium text-white">{order.billing_address.street}</p>
                  <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip}</p>
                  <p>{order.billing_address.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-600">
                <h3 className="text-lg font-semibold text-white">Order Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax (10%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="mt-4 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <p className="text-sm text-gray-400 font-semibold">Tracking Number</p>
                    <p className="text-white font-mono mt-1">{order.tracking_number}</p>
                  </div>
                )}

                {order.payment_method && (
                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <p className="text-sm text-gray-400 font-semibold">Payment Method</p>
                    <p className="text-white capitalize mt-1">{order.payment_method}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/orders"
                className="block text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                View All Orders
              </Link>
              <Link
                href="/products"
                className="block text-center border border-blue-600 text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-500/10 transition-all duration-200"
              >
                Continue Shopping
              </Link>
            </div>

            {order.notes && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📝 Notes
                </h3>
                <p className="text-gray-300 text-sm">{order.notes}</p>
              </div>
            )}
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
