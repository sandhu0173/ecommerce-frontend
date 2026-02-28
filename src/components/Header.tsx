'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { cartApi, authApi } from '@/lib/api'

interface CartSummary {
  item_count: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
}

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Fetch cart count on mount and when authenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    }
  }, [isAuthenticated])

  const fetchCartCount = async () => {
    try {
      const response = await cartApi.getSummary()
      setCartCount(response.data.data.item_count || 0)
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      localStorage.removeItem('auth_token')
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount()
    }
    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section: Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <i className="fas fa-shopping-bag text-xl text-white"></i>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">Store</span>
          </Link>

          {/* Center Section: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200">
              <i className="fas fa-home"></i> Home
            </Link>
            <Link href="/products" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200">
              <i className="fas fa-box"></i> Products
            </Link>
          </nav>

          {/* Right Section: User Actions */}
          <div className="flex items-center gap-6">
            {isAuthenticated && user ? (
              <>
                {/* Cart Icon */}
                <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white transition-colors duration-200 hover:bg-slate-700/50 rounded-lg">
                  <i className="fas fa-shopping-cart text-xl"></i>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Icon with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    onMouseEnter={() => setUserDropdownOpen(true)}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700/50 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="fas fa-box w-5"></i>
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="fas fa-heart w-5"></i>
                          <span>Wishlist</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="fas fa-user-circle w-5"></i>
                          <span>Profile Settings</span>
                        </Link>

                        <div className="border-t border-slate-700 my-2"></div>

                        <button
                          onClick={() => {
                            handleLogout()
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                        >
                          <i className="fas fa-sign-out-alt w-5"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* User Icon - Redirects to Login */}
                <Link
                  href="/auth/login"
                  className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-gray-500/50 transition-all"
                  title="Login"
                >
                  <i className="fas fa-user"></i>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white text-2xl p-2 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="py-3 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                <i className="fas fa-home"></i> Home
              </Link>
              <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                <i className="fas fa-box"></i> Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Export function to trigger cart update event
export const triggerCartUpdate = () => {
  window.dispatchEvent(new Event('cart-updated'))
}
