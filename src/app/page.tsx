'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { productApi, cartApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Product {
  id: number
  name: string
  slug: string
  price: string
  image_url: string
  is_featured: boolean
  stock: number
  rating: number
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [productsInCart, setProductsInCart] = useState<Set<number>>(new Set())
  const [cartSuccess, setCartSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Fetch cart products when authenticated
    if (isAuthenticated) {
      fetchCartProducts()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productApi.list({ limit: 20 })
      const products = response.data.data || []
      setAllProducts(products)
      setFeaturedProducts(products.filter((p: Product) => p.is_featured).slice(0, 6))
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartProducts = async () => {
    try {
      const response = await cartApi.getCart()
      const cartItems = response.data.data.items || []
      const productIds = new Set(cartItems.map((item: any) => item.product_id))
      setProductsInCart(productIds)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }

  const getDummyImage = (productId: number) => {
    return `https://picsum.photos/400/400?random=${productId}`
  }

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/auth/login')
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

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <span className="text-sm text-blue-400 font-semibold"><i className="fas fa-star"></i> Welcome to Premium Shopping</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your Next
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Favorite Product
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Handpicked collection of premium products for the discerning customer
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/products" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2 group">
              <i className="fas fa-shopping-bag"></i> Explore Products
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="#featured" className="px-8 py-4 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
              <i className="fas fa-star"></i> View Featured
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">5000+</div>
              <div className="text-gray-400 text-sm mt-2"><i className="fas fa-box"></i> Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">50K+</div>
              <div className="text-gray-400 text-sm mt-2"><i className="fas fa-smile"></i> Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">24/7</div>
              <div className="text-gray-400 text-sm mt-2"><i className="fas fa-headset"></i> Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-20 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4"><i className="fas fa-star"></i> Featured Products</h2>
            <p className="text-gray-400 text-lg">Hand-picked selections just for you</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-slate-900"></div>
              </div>
              <p className="text-gray-300 mt-4">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
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
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link href={`/products/${product.slug}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 flex-1">
                          {product.name}
                        </h3>
                        {product.is_featured && <i className="fas fa-star text-xl ml-2 text-yellow-400"></i>}
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 mb-3">
                      <span>{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</span>
                      <span className="text-xs text-gray-400 ml-2">({product.rating}/5)</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.stock > 0 ? `${product.stock} left` : 'Out'}
                      </span>
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
                        disabled={addingToCart === product.id || product.stock === 0 || !isAuthenticated}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No featured products available</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-600 text-white rounded-lg font-semibold hover:border-blue-500 hover:text-blue-400 transition-all">
              View All Products
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4"><i className="fas fa-check-circle"></i> Why Choose Us</h2>
            <p className="text-gray-400 text-lg">The best shopping experience you can get</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-8 hover:border-blue-500 transition-colors">
              <i className="fas fa-truck text-5xl mb-4 text-blue-400"></i>
              <h3 className="text-xl font-semibold text-white mb-3">Fast Shipping</h3>
              <p className="text-gray-400">Get your orders delivered within 2-3 business days</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-8 hover:border-blue-500 transition-colors">
              <i className="fas fa-shield text-5xl mb-4 text-blue-400"></i>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Payment</h3>
              <p className="text-gray-400">100% secure checkout with multiple payment options</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-8 hover:border-blue-500 transition-colors">
              <i className="fas fa-redo text-5xl mb-4 text-blue-400"></i>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Returns</h3>
              <p className="text-gray-400">30-day return policy for complete peace of mind</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-8 hover:border-blue-500 transition-colors">
              <i className="fas fa-headset text-5xl mb-4 text-blue-400"></i>
              <h3 className="text-xl font-semibold text-white mb-3">24/7 Support</h3>
              <p className="text-gray-400">Expert support team ready to help anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4"><i className="fas fa-star"></i> What Customers Say</h2>
            <p className="text-gray-400 text-lg">Join thousands of satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'John Doe', rating: 5, text: 'Excellent products and fast shipping! Highly recommended.' },
              { name: 'Sarah Smith', rating: 5, text: 'Amazing customer service and great quality items.' },
              { name: 'Mike Johnson', rating: 5, text: 'Best online shopping experience I&apos;ve had!' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-8">
                <div className="flex items-center gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <i key={i} className="fas fa-star text-xl text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-gray-400 text-xs">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Shop?</h2>
          <p className="text-xl text-gray-400 mb-8">Start exploring our amazing collection today</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all">
            <i className="fas fa-shopping-bag"></i> Browse Products
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-shopping-bag text-2xl text-cyan-400"></i>
                <span className="font-bold text-white">Store</span>
              </div>
              <p className="text-gray-400 text-sm">Your destination for premium products</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4"><i className="fas fa-box"></i> Shop</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
                <li><Link href="/products" className="hover:text-white transition">Categories</Link></li>
                <li><Link href="/products" className="hover:text-white transition">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4"><i className="fas fa-phone"></i> Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4"><i className="fas fa-link"></i> Connect</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Premium Store. All rights reserved. <i className="fas fa-lock"></i></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
