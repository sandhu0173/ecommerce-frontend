'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { productApi, cartApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'

interface CartItem {
  id: number
  product_id: number
  quantity: number
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: string
  cost_price: string
  stock: number
  sku: string
  image_url: string
  images: string[]
  status: string
  is_featured: boolean
  rating: number
  review_count: number
  profit: string
  profit_margin: string
  is_available: boolean
  is_low_stock: boolean
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, isAuthenticated } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addToCartMessage, setAddToCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isProductInCart, setIsProductInCart] = useState(false)

  // Generate dummy image URL based on product ID
  const getDummyImage = (productId: number, variation: number = 0) => {
    return `https://picsum.photos/500/500?random=${productId}-${variation}`
  }

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    // Fetch cart to check if this product is already in it
    if (isAuthenticated && product) {
      checkIfProductInCart()
    }
  }, [isAuthenticated, product])

  const checkIfProductInCart = async () => {
    try {
      const response = await cartApi.getCart()
      const cartItems = response.data.data.items || []
      const productInCart = cartItems.some((item: CartItem) => item.product_id === product?.id)
      setIsProductInCart(productInCart)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await productApi.show(slug)
      setProduct(response.data.data)
    } catch (err) {
      setError('Product not found')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!product) return

    setAddingToCart(true)
    setAddToCartMessage(null)

    try {
      await cartApi.addProduct(product.id, quantity)
      setIsProductInCart(true)
      setAddToCartMessage({
        type: 'success',
        text: `✓ Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`,
      })
      setQuantity(1)

      // Trigger cart update event for Header
      window.dispatchEvent(new Event('cart-updated'))

      // Auto-clear message after 3 seconds
      setTimeout(() => setAddToCartMessage(null), 3000)
    } catch (err: any) {
      setAddToCartMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add to cart',
      })
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-slate-900"></div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-400 text-lg mb-6">{error}</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              Back to Products
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

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 aspect-square flex items-center justify-center mb-6 overflow-hidden">
              <img
                src={product.image_url || getDummyImage(product.id, 0)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDummyImage(product.id, 0)
                }}
              />
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-600 aspect-square flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
                >
                  <img
                    src={product.images && product.images[idx] ? product.images[idx] : getDummyImage(product.id, idx + 1)}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDummyImage(product.id, idx + 1)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title & Badge */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">{product.name}</h1>
                  <p className="text-gray-400 text-sm mt-2">SKU: {product.sku}</p>
                </div>
                {product.is_featured && (
                  <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {product.rating}/5 ({product.review_count} review{product.review_count !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.cost_price && parseFloat(product.cost_price) > parseFloat(product.price) && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ${parseFloat(product.cost_price).toFixed(2)}
                      </span>
                      <span className="text-green-400 font-bold text-sm">
                        Save ${(parseFloat(product.profit) || 0).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
              <div className="space-y-3">
                {product.is_available ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <span className="text-green-400 font-semibold text-lg">In Stock</span>
                    </div>
                    {product.is_low_stock && (
                      <p className="text-orange-400 text-sm font-medium">⚠️ Only {product.stock} items left!</p>
                    )}
                    <p className="text-gray-400 text-sm">{product.stock} units available</p>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <span className="text-red-400 font-semibold text-lg">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.is_available && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6 space-y-4">
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={addingToCart}
                    className="px-4 py-2 border border-slate-500 rounded-lg text-white font-bold hover:bg-slate-700 hover:border-blue-500 transition-colors disabled:opacity-50 text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                    disabled={addingToCart}
                    className="w-20 text-center border border-slate-500 rounded-lg py-2 bg-slate-700/50 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={addingToCart}
                    className="px-4 py-2 border border-slate-500 rounded-lg text-white font-bold hover:bg-slate-700 hover:border-blue-500 transition-colors disabled:opacity-50 text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart or Go to Cart Button */}
                {isProductInCart ? (
                  <Link
                    href="/cart"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 text-lg flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-arrow-right"></i> Go to Cart
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/50 text-lg"
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Adding to Cart...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-shopping-cart"></i> Add to Cart
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Add to Cart Message */}
            {addToCartMessage && (
              <div
                className={`p-4 rounded-xl border backdrop-blur ${
                  addToCartMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <p className="font-medium">{addToCartMessage.text}</p>
                {addToCartMessage.type === 'success' && (
                  <p className="text-sm text-gray-400 mt-2">
                    <Link href="/cart" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      View Cart →
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between pb-3 border-b border-slate-600">
                  <dt className="text-gray-400 font-medium">Status</dt>
                  <dd className="font-semibold text-white capitalize">{product.status}</dd>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-600">
                  <dt className="text-gray-400 font-medium">Stock Available</dt>
                  <dd className="font-semibold text-white">{product.stock} units</dd>
                </div>
                {product.profit_margin && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400 font-medium">Profit Margin</dt>
                    <dd className="font-semibold text-white">{product.profit_margin}%</dd>
                  </div>
                )}
              </dl>
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
