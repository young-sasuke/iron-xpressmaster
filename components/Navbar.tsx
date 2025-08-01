"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Bell, ShoppingCart, Menu, X } from "lucide-react"

interface NavbarProps {
  cartCount: number
}

export default function Navbar({ cartCount }: NavbarProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo */}
          <div onClick={() => router.push("/")} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-all duration-200 transform group-hover:scale-105">
              <span className="text-white font-bold text-sm sm:text-base">IX</span>
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              IronXpress
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium transform group-hover:scale-110 transition-transform duration-200">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.path)
                    setIsMobileMenuOpen(false)
                  }}
                  className="relative flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <item.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
