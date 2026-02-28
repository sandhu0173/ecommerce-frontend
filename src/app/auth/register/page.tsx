'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password, passwordConfirmation)
      router.push('/products')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-lg">
            <i className="fas fa-user-plus text-2xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Join Us
          </h1>
          <p className="text-gray-400">Create your account to start shopping</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-user w-4 h-4 text-blue-400"></i>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-envelope w-4 h-4 text-blue-400"></i>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-lock w-4 h-4 text-blue-400"></i>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <i className="fas fa-info-circle"></i>
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-check-circle w-4 h-4 text-blue-400"></i>
                Confirm Password
              </label>
              <input
                id="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Password Match Indicator */}
            {password && passwordConfirmation && (
              <div className="flex items-center gap-2 text-sm">
                {password === passwordConfirmation ? (
                  <>
                    <i className="fas fa-check-circle text-green-400"></i>
                    <span className="text-green-400">Passwords match</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle text-red-400"></i>
                    <span className="text-red-400">Passwords don&apos;t match</span>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 shadow-lg hover:shadow-blue-500/50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Features List */}
          <div className="mt-6 space-y-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-star"></i>
              What you&apos;ll get
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Exclusive deals and discounts
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Fast, secure checkout
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Order tracking
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-cyan-400 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>

          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
