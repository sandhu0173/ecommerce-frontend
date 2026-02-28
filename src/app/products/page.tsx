'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { productApi, cartApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'

interface Product {
  id: number
  name: string
  slug: string
  price: string
  cost_price: string
  stock: number
  sku: string
  image_url: string
  status: string
  is_featured: boolean
  rating: number
  review_count: number
}

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: Infinity },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]!)
  const [showFilters, setShowFilters] = useState(false)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [productsInCart, setProductsInCart] = useState<Set<number>>(new Set())
  const [cartSuccess, setCartSuccess] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const fetchCartProducts = async () => {
    try {
      const response = await cartApi.getCart()
      const cartItems = response.data.data.items || []
      const productIds = new Set<number>(cartItems.map((item: any) => item.product_id))
      setProductsInCart(productIds)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }

  const getDummyImage = (productId: number) => {
    return `https://picsum.photos/400/400?random=${productId}`
  }

  useEffect(() => {
    fetchProducts()
  }, [search, sortBy])

  useEffect(() => {
    filterProducts()
  }, [products, priceRange, search])

  useEffect(() => {
    // Fetch cart products when authenticated
    if (isAuthenticated) {
      fetchCartProducts()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await productApi.list({
        search: search || undefined,
        sort: sortBy,
        order: 'desc',
        limit: 50,
      })
      setProducts(response.data.data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Apply price filter
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price)
      return price >= priceRange.min && price <= priceRange.max
    })

    setFilteredProducts(filtered)
  }

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    try {
      setAddingToCart(productId)
      await (await import('@/lib/api')).cartApi.addProduct(productId, 1)
      setProductsInCart(prev => new Set(prev).add(productId))
      setCartSuccess('Product added to cart!')

      // Trigger cart update event for Header
      window.dispatchEvent(new Event('cart-updated'))

      setTimeout(() => setCartSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      setError('Failed to add product to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const handleGoToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">📦 Our Products</h1>
          <p className="text-gray-400">Discover our amazing collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="created_at"><i className="fas fa-clock"></i> Newest</option>
                <option value="price"><i className="fas fa-arrow-up"></i> Price: Low to High</option>
                <option value="-price"><i className="fas fa-arrow-down"></i> Price: High to Low</option>
                <option value="rating"><i className="fas fa-star"></i> Best Rated</option>
                <option value="name"><i className="fas fa-font"></i> Name A-Z</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg font-semibold hover:border-blue-500 transition-all flex items-center gap-2 justify-center"
            >
              <i className="fas fa-filter"></i> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
              <h3 className="text-xl font-semibold text-white mb-4"><i className="fas fa-dollar-sign"></i> Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange(range)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      priceRange.label === range.label
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {cartSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 font-medium"><i className="fas fa-check-circle"></i> {cartSuccess}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 font-medium"><i className="fas fa-exclamation-circle"></i> {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-slate-900"></div>
              </div>
              <p className="text-gray-300 mt-4 text-lg">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-12 text-center">
            <div className="text-6xl mb-4"><i className="fas fa-inbox text-gray-400"></i></div>
            <p className="text-gray-400 text-lg">No products found</p>
            {search && <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {/* Product Image - Clickable Link */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                      <img
                        src={product.image_url || getDummyImage(product.id)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDummyImage(product.id)
                        }}
                      />
                      {product.is_featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                          <i className="fas fa-star"></i> Featured
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2 h-14">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-sm flex items-center gap-0.5">
                          {Array(product.rating).fill(0).map((_, i) => (
                            <i key={i} className="fas fa-star text-yellow-400"></i>
                          ))}
                          {Array(5 - product.rating).fill(0).map((_, i) => (
                            <i key={i} className="fas fa-star text-gray-400"></i>
                          ))}
                        </span>
                        <span className="text-xs text-gray-400">({product.review_count})</span>
                      </div>
                    )}

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ${parseFloat(product.price).toFixed(2)}
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        product.stock > 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.stock > 0 ? `${product.stock} left` : 'Out'}
                      </div>
                    </div>

                    {/* Add to Cart or Go to Cart Button */}
                    {productsInCart.has(product.id) ? (
                      <button
                        onClick={(e) => handleGoToCart(e)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-cyan-500 hover:to-blue-500 transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-arrow-right"></i> Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(product.id, e)}
                        disabled={addingToCart === product.id || product.stock === 0}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-sm hover:from-blue-500 hover:to-cyan-500 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className={`fas ${addingToCart === product.id ? 'fa-spinner animate-spin' : 'fa-shopping-cart'}`}></i>
                        {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="text-center text-gray-400 py-8">
              <p>Showing <span className="text-white font-semibold">{filteredProducts.length}</span> of <span className="text-white font-semibold">{products.length}</span> products</p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>&copy; 2026 Premium Store. All rights reserved. <i className="fas fa-lock"></i></p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          fetchCartProducts()
        }}
      />
    </div>
  )
}
