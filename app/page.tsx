import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-blue-900/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIMS</h1>
                <p className="text-xs text-blue-300 font-medium">Autonomous Inventory Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 text-blue-300 hover:text-white transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60">
                    Get Started Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60">
                    Go to Dashboard
                  </button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-6">
            <span className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-full text-sm font-semibold">
              🚀 AI-Powered Inventory Solution
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Revolutionize Your
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">
              Inventory Management
            </span>
          </h1>
          
          <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of inventory control with AI-powered product detection, real-time analytics, 
            automated stock optimization, and intelligent demand forecasting—all in one powerful platform.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105">
                  Start Free Trial
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-slate-800/80 border-2 border-blue-500/50 text-white rounded-xl font-bold text-lg hover:bg-slate-700/80 hover:border-blue-400 transition-all">
                  View Demo
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105">
                  Open Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">99.8%</div>
              <div className="text-blue-300 text-sm font-medium">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">50%</div>
              <div className="text-blue-300 text-sm font-medium">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Real-time</div>
              <div className="text-blue-300 text-sm font-medium">Analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Everything you need to manage your inventory efficiently and intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Vision Detection</h3>
              <p className="text-blue-200 leading-relaxed">
                Upload product images and let our trained ML model identify items instantly with 99.8% accuracy. Supports 80+ grocery products.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-time Analytics</h3>
              <p className="text-blue-200 leading-relaxed">
                Track inventory levels, sales velocity, stock turnover, and category performance with live dashboards and insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
                <span className="text-3xl">🔔</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Smart Notifications</h3>
              <p className="text-blue-200 leading-relaxed">
                Get instant alerts for low stock, expiring items, and restocking needs. Automated notifications keep you ahead.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/50">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Auto-Optimization</h3>
              <p className="text-blue-200 leading-relaxed">
                Automatically identify urgent, high, and medium priority stock items. One-click optimization for efficient restocking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/50">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Demand Forecasting</h3>
              <p className="text-blue-200 leading-relaxed">
                Predict future demand with seasonal trends analysis, festival impact tracking, and velocity-based recommendations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/50">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Multi-Modal Input</h3>
              <p className="text-blue-200 leading-relaxed">
                Add products via image upload, barcode scanning, or manual entry. Flexible input methods for maximum convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sign Up</h3>
              <p className="text-blue-300 text-sm">Create your free account in seconds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Add Products</h3>
              <p className="text-blue-300 text-sm">Upload images or scan barcodes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/50">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track & Analyze</h3>
              <p className="text-blue-300 text-sm">Monitor stock with real-time insights</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/50">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Optimize</h3>
              <p className="text-blue-300 text-sm">Let AI handle restocking decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Inventory?
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Join businesses using AIMS to automate inventory management and boost efficiency by 50%
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105">
                  Start Free Trial
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-950 border-t border-blue-900/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIMS</span>
              </div>
              <p className="text-blue-300 text-sm">
                Autonomous Inventory Management System powered by AI and ML
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Demo</li>
                <li>API</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">Resources</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li>Documentation</li>
                <li>Support</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-900/50 pt-8 text-center">
            <p className="text-blue-300 text-sm">
              © 2025 AIMS - Autonomous Inventory Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
