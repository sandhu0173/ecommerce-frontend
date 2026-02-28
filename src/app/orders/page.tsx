'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'
import { orderApi } from '@/lib/api'

interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  item_count: number
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '' as string,
    payment_status: '' as string,
    sort: 'newest' as string,
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const params: any = {}
        if (filters.status) params.status = filters.status
        if (filters.payment_status) params.payment_status = filters.payment_status
        if (filters.sort) params.sort = filters.sort

        const response = await orderApi.list(params)
        setOrders(response.data.data.orders || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [authLoading, user, router, filters])

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-slate-900"></div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Your Orders</h1>
          <p className="text-gray-400 text-lg mt-2">Track and manage your purchases</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur">
            <p className="text-red-400 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6 mb-8 backdrop-blur">
          <h2 className="text-lg font-semibold text-white mb-6">Filters & Sort</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Payment</label>
              <select
                value={filters.payment_status}
                onChange={(e) => setFilters((prev) => ({ ...prev, payment_status: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Sort</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_high">Highest Price</option>
                <option value="price_low">Lowest Price</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">&nbsp;</label>
              <button
                onClick={() => setFilters({ status: '', payment_status: '', sort: 'newest' })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-12 text-center backdrop-blur">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-400 text-lg mb-6">No orders found</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 hover:border-blue-500 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg border font-semibold text-sm flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        <span>{getStatusIcon(order.status)}</span>
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-1">Date</p>
                        <p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-1">Items</p>
                        <p className="text-white">{order.item_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-1">Payment</p>
                        <p className={`font-semibold capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-1">Total</p>
                        <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="text-2xl text-gray-400 group-hover:text-cyan-400 transition-colors">→</div>
                  </div>
                </div>
              </Link>
            ))}
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
